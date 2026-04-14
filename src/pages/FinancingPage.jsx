import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import SlidingBanner from '../components/SlidingBanner/SlidingBanner';
import { API_BASE_URL, BACKEND_URL } from '../config/api';
import './FinancingPage.css';

const FinancingPage = () => {
  const [collapsedConditions, setCollapsedConditions] = useState(new Set());
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState('');

  const companiesEndpoint = useMemo(() => `${API_BASE_URL}/financing-companies/all`, []);

  const steps = [
    {
      title: 'Fill your cart.',
      description: 'Add your desired products to the cart and place your order today.',
      image: '/Financing/financing-cart.png'
    },
    {
      title: 'Choose payment.',
      description: 'Submit an online application and receive your result within minutes.',
      image: '/Financing/financing-payment.png'
    },
    {
      title: 'Pay over time.',
      description: 'Own the product of your dreams with monthly payment options that fit your budget.',
      image: '/Financing/financing-time.png'
    }
  ];

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        setCompaniesError('');

        const res = await fetch(companiesEndpoint);
        if (!res.ok) throw new Error(`Failed to load financing companies (${res.status})`);
        const data = await res.json();
        const companiesArray = Array.isArray(data) ? data : [];
        setCompanies(companiesArray);
        setCollapsedConditions(new Set(companiesArray.map(c => c._id)));
      } catch (err) {
        setCompanies([]);
        setCompaniesError(err.message || 'Failed to load financing companies');
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [companiesEndpoint]);

  const toggleCondition = (conditionKey) => {
    setCollapsedConditions((prev) => {
      const next = new Set(prev);
      if (next.has(conditionKey)) {
        next.delete(conditionKey);
      } else {
        next.add(conditionKey);
      }
      return next;
    });
  };

  const normalizeConditionPoints = (condition) => {
    if (!condition) return [];
    if (Array.isArray(condition.points)) {
      return condition.points.filter((p) => typeof p === 'string' && p.trim().length > 0);
    }
    if (Array.isArray(condition)) {
      return condition.filter((p) => typeof p === 'string' && p.trim().length > 0);
    }
    if (typeof condition === 'string') {
      return [condition];
    }
    return [];
  };

  const parseDetailsPoints = (rawDetails) => {
    if (typeof rawDetails !== 'string') return [];

    return rawDetails
      .split(/\r?\n|\u2022/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const hasConditionContent = (condition) => {
    const title = condition?.title?.trim();
    const description = condition?.description?.trim();
    const points = normalizeConditionPoints(condition);
    return Boolean(title || description || points.length > 0);
  };

  return (
    <div className="financing-page">
      <Header />
      
      {/* Hero Section */}
      <section className="financing-hero">
        <div className="financing-hero-content">
          <h1>Financing</h1>
          
        </div>
      </section>

      {/* Easy Financing Section */}
      <section className="easy-financing">
        <span className="section-tag">EASY FINANCING, ANYTIME!</span>
        <h2>We offer a range of flexible financing options tailored to your specific needs.</h2>
        <p>
          We're here to make your furniture shopping experience as flexible and stress-free as possible because 
          we understand that everyone's financial situation is unique. That's why we offer a range of flexible 
          financing options tailored to your specific needs.
        </p>
      </section>

      {/* Financing Options - Using SlidingBanner */}
      <SlidingBanner />

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How it works?</h2>
        <div className="steps-grid">
          {steps.map((step, idx) => (
            <div key={idx} className="step-card">
              <div className="step-image-wrapper">
                <img src={step.image} alt={step.title} className="step-image" />
              </div>
              <div className="step-bottom">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="financing-companies-section">
        {loadingCompanies && <div className="financing-state">Loading financing options...</div>}
        {!loadingCompanies && companiesError && <div className="financing-state error">{companiesError}</div>}
        {!loadingCompanies && !companiesError && companies.length === 0 && (
          <div className="financing-state">No financing companies available right now.</div>
        )}

        {!loadingCompanies &&
          !companiesError &&
          companies.map((company) => {
            const companyConditions = Array.isArray(company.conditions) ? company.conditions : [];
            const detailPoints = parseDetailsPoints(company.details);

            return (
              <article key={company._id} className="company-block">
                <div className="snap-finance-section">
                  <div className="snap-header">
                    <h2>{company.companyName}</h2>
                    {company.details && <p>{company.details}</p>}
                  </div>

                  <div className="snap-details">
                    <div className="snap-left">
                      <div className="snap-logo-box">
                        {company.logo ? (
                          <img
                            src={company.logo.startsWith('http') ? company.logo : `${BACKEND_URL}/${company.logo}`}
                            alt={company.companyName}
                            className="company-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="snap-logo-placeholder">{(company.companyName || '?').charAt(0)}</div>
                        )}
                      </div>
                    </div>
                    <div className="snap-right">
                      <h3>{company.title}</h3>
                      <p className="location-label">In-Store & Online</p>

                      <ul className="snap-features">
                        {detailPoints.map((point, idx) => (
                          <li key={`${company._id}-p-${idx}`}>{point}</li>
                        ))}
                        {detailPoints.length === 0 && normalizeConditionPoints(companyConditions[0]).map((point, idx) => (
                          <li key={`${company._id}-fallback-p-${idx}`}>{point}</li>
                        ))}
                        {detailPoints.length === 0 && normalizeConditionPoints(companyConditions[0]).length === 0 && company.details && (
                          <li>{company.details}</li>
                        )}
                      </ul>

                      <a href={company.applyLink} target="_blank" rel="noreferrer" className="apply-now-btn">
                        Apply Now
                      </a>
                    </div>
                  </div>
                </div>

                <section className="conditions-section">
                  {companyConditions.length === 0 || !companyConditions.some(hasConditionContent) ? (
                    <div className="condition-item">
                      <button className="condition-toggle" type="button" disabled>
                        <span className="condition-icon">✎</span>
                        Conditions
                        <span className="toggle-arrow">⌄</span>
                      </button>
                    </div>
                  ) : (
                    <div className="condition-item">
                      <button
                        className={`condition-toggle ${!collapsedConditions.has(company._id) ? 'active' : ''}`}
                        onClick={() => toggleCondition(company._id)}
                        type="button"
                      >
                        <span className="condition-icon">✎</span>
                        Conditions
                        <span className="toggle-arrow">⌄</span>
                      </button>

                      {!collapsedConditions.has(company._id) && (
                        <div className="condition-content">
                          {companyConditions.filter(hasConditionContent).map((condition, idx) => {
                            const points = normalizeConditionPoints(condition);
                            return (
                              <div key={`${company._id}-condition-${idx}`} className="condition-entry">
                                {condition?.title?.trim() && (
                                  <h4 className="condition-entry-title">{condition.title.trim()}</h4>
                                )}
                                {condition?.description?.trim() && (
                                  <p className="condition-entry-description">{condition.description.trim()}</p>
                                )}
                                {points.length > 0 && (
                                  <ul className="condition-points">
                                    {points.map((point, pointIdx) => (
                                      <li key={`${company._id}-condition-${idx}-point-${pointIdx}`}>{point}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </article>
            );
          })}
      </section>

      <Footer />
    </div>
  );
};

export default FinancingPage;
