import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { getImageUrl, getAlternateImageUrl } from '../utils/imageUrl';
import './CategoryPage.css';

const normalizeFilterText = (value) => String(value || '').trim();
const normalizeKeyPart = (value) => normalizeFilterText(value).toLowerCase().replace(/[^a-z0-9]+/g, '_');

const addOptionCount = (sectionMap, key, label, value, type = 'text', extra = {}) => {
  const cleanLabel = normalizeFilterText(label);
  const cleanValue = normalizeFilterText(value);

  if (!cleanLabel || !cleanValue) return;

  if (!sectionMap.has(key)) {
    sectionMap.set(key, {
      key,
      label: cleanLabel,
      type,
      optionsMap: new Map()
    });
  }

  const section = sectionMap.get(key);
  const current = section.optionsMap.get(cleanValue) || { value: cleanValue, count: 0, ...extra };
  section.optionsMap.set(cleanValue, {
    ...current,
    ...extra,
    count: current.count + 1
  });
};

const getValuesForFilterKey = (product, filterKey) => {
  if (!product) return [];

  if (filterKey === 'productType') {
    return [product.subSubCategoryName, product.subCategoryName].filter(Boolean).map(normalizeFilterText);
  }

  if (filterKey === 'availability') {
    return [Number(product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'];
  }

  if (filterKey === 'color') {
    const selectedColors = Array.isArray(product.selectedColors) ? product.selectedColors : [];
    const customColors = Array.isArray(product.customColors) ? product.customColors.map((c) => c?.name) : [];
    return [...selectedColors, ...customColors].filter(Boolean).map(normalizeFilterText);
  }

  if (filterKey === 'variation') {
    return (Array.isArray(product.variations) ? product.variations : [])
      .map((variation) => variation?.name)
      .filter(Boolean)
      .map(normalizeFilterText);
  }

  if (filterKey.startsWith('spec:')) {
    const targetKey = filterKey.replace('spec:', '');
    const specs = Array.isArray(product.specifications) ? product.specifications : [];
    const values = [];

    specs.forEach((group) => {
      (Array.isArray(group?.fields) ? group.fields : []).forEach((field) => {
        if (normalizeKeyPart(field?.name) !== targetKey) return;
        (Array.isArray(field?.values) ? field.values : []).forEach((value) => {
          const cleanValue = normalizeFilterText(value);
          if (cleanValue) values.push(cleanValue);
        });
      });
    });

    return values;
  }

  return [];
};

const buildDynamicFilterSections = (products) => {
  const sectionMap = new Map();
  const priceValues = products
    .map((product) => Number(product?.price))
    .filter((value) => Number.isFinite(value) && value >= 0);

  products.forEach((product) => {
    const seenBySection = new Map();

    const markSeen = (sectionKey, optionValue) => {
      const cleanValue = normalizeFilterText(optionValue);
      if (!cleanValue) return false;
      if (!seenBySection.has(sectionKey)) seenBySection.set(sectionKey, new Set());
      const set = seenBySection.get(sectionKey);
      if (set.has(cleanValue)) return false;
      set.add(cleanValue);
      return true;
    };

    getValuesForFilterKey(product, 'productType').forEach((value) => {
      if (!markSeen('productType', value)) return;
      addOptionCount(sectionMap, 'productType', 'Product Type', value);
    });

    getValuesForFilterKey(product, 'availability').forEach((value) => {
      if (!markSeen('availability', value)) return;
      addOptionCount(sectionMap, 'availability', 'Availability', value);
    });

    const customColorHexByName = new Map(
      (Array.isArray(product.customColors) ? product.customColors : [])
        .filter((color) => color?.name)
        .map((color) => [normalizeFilterText(color.name).toLowerCase(), color.hex || ''])
    );

    getValuesForFilterKey(product, 'color').forEach((value) => {
      if (!markSeen('color', value)) return;
      addOptionCount(sectionMap, 'color', 'Color', value, 'color', {
        hex: customColorHexByName.get(value.toLowerCase()) || ''
      });
    });

    getValuesForFilterKey(product, 'variation').forEach((value) => {
      if (!markSeen('variation', value)) return;
      addOptionCount(sectionMap, 'variation', 'Variation', value);
    });

    const specs = Array.isArray(product.specifications) ? product.specifications : [];
    specs.forEach((group) => {
      (Array.isArray(group?.fields) ? group.fields : []).forEach((field) => {
        const fieldName = normalizeFilterText(field?.name);
        if (!fieldName) return;
        const sectionKey = `spec:${normalizeKeyPart(fieldName)}`;

        (Array.isArray(field?.values) ? field.values : []).forEach((value) => {
          if (!markSeen(sectionKey, value)) return;
          addOptionCount(sectionMap, sectionKey, fieldName, value);
        });
      });
    });
  });

  const fixedOrder = ['productType', 'availability', 'price', 'color', 'variation'];
  const sections = Array.from(sectionMap.values()).map((section) => ({
    key: section.key,
    label: section.label,
    type: section.type,
    options: Array.from(section.optionsMap.values()).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
  }));

  const derivedMin = priceValues.length > 0 ? Math.floor(Math.min(...priceValues)) : 0;
  const derivedMaxRaw = priceValues.length > 0 ? Math.ceil(Math.max(...priceValues)) : 10000;
  const derivedMax = derivedMaxRaw <= derivedMin ? derivedMin + 1 : derivedMaxRaw;

  const withPrice = [
    ...sections,
    {
      key: 'price',
      label: 'Price',
      type: 'price',
      options: [],
      meta: {
        min: derivedMin,
        max: derivedMax,
        step: 1
      }
    }
  ];

  return withPrice.sort((a, b) => {
    const ia = fixedOrder.indexOf(a.key);
    const ib = fixedOrder.indexOf(b.key);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.label.localeCompare(b.label);
  });
};

const applyFilters = (products, filters) => {
  let filtered = [...products];

  if (filters?.price?.min) {
    filtered = filtered.filter((product) => Number(product.price) >= Number(filters.price.min));
  }

  if (filters?.price?.max) {
    filtered = filtered.filter((product) => Number(product.price) <= Number(filters.price.max));
  }

  Object.entries(filters || {}).forEach(([filterKey, selectedValues]) => {
    if (filterKey === 'price' || !Array.isArray(selectedValues) || selectedValues.length === 0) return;

    const selectedSet = new Set(selectedValues.map((value) => normalizeFilterText(value).toLowerCase()));
    filtered = filtered.filter((product) => {
      const values = getValuesForFilterKey(product, filterKey).map((value) => value.toLowerCase());
      return values.some((value) => selectedSet.has(value));
    });
  });

  return filtered;
};

export default function BrandPage() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const selectedBrandParam = decodeURIComponent(brandId);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ price: { min: '', max: '' } });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [brandsRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/brands/all`),
          axios.get(`${API_BASE_URL}/products/all`)
        ]);

        const brands = Array.isArray(brandsRes.data) ? brandsRes.data : [];
        const list = Array.isArray(productsRes.data) ? productsRes.data : [];

        const matchedBrand = brands.find((item) => {
          const idMatches = String(item._id) === String(selectedBrandParam);
          const nameMatches = item.name?.trim().toLowerCase() === selectedBrandParam.trim().toLowerCase();
          return idMatches || nameMatches;
        });

        const selectedBrandName = matchedBrand?.name || selectedBrandParam;
        const selectedBrandKey = String(matchedBrand?._id || selectedBrandParam);

        const filtered = list.filter((p) => {
          const brandIds = Array.isArray(p.brandIds) ? p.brandIds : [];
          const productBrandName = p.brandId?.trim().toLowerCase();
          const selectedName = selectedBrandName.trim().toLowerCase();

          return (
            String(p.brandId) === String(selectedBrandParam) ||
            String(p.brandId) === selectedBrandKey ||
            brandIds.map(String).includes(String(selectedBrandParam)) ||
            brandIds.map(String).includes(selectedBrandKey) ||
            productBrandName === selectedName ||
            brandIds.some((value) => String(value).trim().toLowerCase() === selectedName)
          );
        });

        setBrand(matchedBrand || { name: selectedBrandName });
        setAllProducts(filtered);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products for brand', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [brandId]);

  useEffect(() => {
    setAppliedFilters({ price: { min: '', max: '' } });
  }, [brandId]);

  const displayBrandName = useMemo(
    () => brand?.name || selectedBrandParam,
    [brand, selectedBrandParam]
  );

  const baseProducts = useMemo(() => [...allProducts], [allProducts]);
  const filterSections = useMemo(() => buildDynamicFilterSections(baseProducts), [baseProducts]);

  useEffect(() => {
    setProducts(applyFilters(baseProducts, appliedFilters));
  }, [baseProducts, appliedFilters]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clearAll') {
      setAppliedFilters({ price: { min: '', max: '' } });
      setProducts(baseProducts);
      return;
    }

    let newFilters = { ...appliedFilters, price: { ...appliedFilters.price } };
    if (filterType === 'clear') {
      if (value === 'price') {
        newFilters.price = { min: '', max: '' };
      } else {
        newFilters[value] = [];
      }
    } else if (filterType === 'price') {
      newFilters.price = value;
    } else {
      const currentValues = appliedFilters[filterType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      newFilters[filterType] = newValues;
    }

    setAppliedFilters(newFilters);
    setProducts(applyFilters(baseProducts, newFilters));
  };

  return (
    <div className="luna-category-page">
      <Header />
      <div className="luna-page-container">
        <nav className="luna-breadcrumb">
          <Link to="/">Home</Link>
          <span className="luna-sep">/</span>
          <span style={{ color: 'var(--luna-orange)', fontWeight: '600' }}>Brands</span>
          <span className="luna-sep">/</span>
          <span style={{ color: 'var(--luna-orange)', fontWeight: '600' }}>{displayBrandName}</span>
        </nav>

        <div className="luna-page-header">
          <h1 className="luna-category-title">{displayBrandName}</h1>
          <p className="luna-product-count">{products.length} products found</p>
        </div>

        <div className="luna-toolbar">
          <button className="luna-filter-toggle-btn" onClick={() => setShowMobileFilters(true)}>
            <span>Filter</span>
          </button>

          <div className="luna-toolbar-right">
            <div className="luna-sort-dropdown">
              <span>Sort by:</span>
              <button className="luna-dropdown-trigger">
                Featured
                <span aria-hidden="true">⌄</span>
              </button>
            </div>

            <div className="luna-view-toggle">
              <span>View as:</span>
              <button
                className={`luna-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ▦
              </button>
              <button
                className={`luna-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        <div className="luna-main-layout">
          <aside className="luna-sidebar">
            <FilterSidebar
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
              filterSections={filterSections}
            />
          </aside>

          <main className="luna-products-area">
            {loading && <div className="loading">Loading products...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && products.length === 0 && (
              <div className="luna-no-results">
                <h3>No products found for this brand.</h3>
                <button onClick={() => navigate('/')} className="luna-clear-btn">
                  Back to Home
                </button>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className={`luna-products-grid ${viewMode}`}>
                {products.map((product, idx) => (
                  <div
                    key={product._id}
                    className="luna-product-card-btn"
                    data-aos="fade-up"
                    data-aos-delay={(idx % 4) * 100}
                    onClick={() => navigate(`/product/${product._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        navigate(`/product/${product._id}`);
                      }
                    }}
                  >
                    <div className="luna-product-card">
                      <div className="luna-card-media">
                        <img
                          src={getImageUrl(product.image || product.images?.[0])}
                          alt={product.name}
                          onError={(event) => {
                            const currentSrc = event.currentTarget.src;
                            const imagePath = product.image || product.images?.[0];
                            const alternateUrl = getAlternateImageUrl(currentSrc, imagePath);
                            if (alternateUrl && alternateUrl !== currentSrc) {
                              event.currentTarget.src = alternateUrl;
                            } else {
                              event.currentTarget.onerror = null;
                            }
                          }}
                        />
                      </div>

                      <div className="luna-card-info">
                        <p className="luna-product-brand">{product.brandId || displayBrandName}</p>
                        <h3 className="luna-product-name">{product.name}</h3>

                        <div className="luna-price-row">
                          <span className="luna-current-price">${product.price}</span>
                          {product.discount > 0 && (
                            <span className="luna-old-price">
                              ${product.price + (product.price * product.discount) / 100}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {showMobileFilters && (
        <div className="luna-mobile-modal">
          <div className="luna-modal-header">
            <h2>Filters</h2>
            <button className="luna-modal-close" onClick={() => setShowMobileFilters(false)}>
              ✕
            </button>
          </div>
          <div className="luna-modal-body">
            <FilterSidebar
              onFilterChange={handleFilterChange}
              appliedFilters={appliedFilters}
              filterSections={filterSections}
            />
          </div>
          <div className="luna-modal-footer">
            <button className="luna-apply-btn" onClick={() => setShowMobileFilters(false)}>
              Show {products.length} Results
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
