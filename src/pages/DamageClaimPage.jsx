import { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { API_BASE_URL } from '../config/api';
import './DamageClaimPage.css';

const initialChecklist = {
  orderNumber: false,
  contactInformation: false,
  dateOfDeliveryDamageLoss: false,
  serialAndSku: false,
  affectedItemsCount: false,
  pictures: false,
  packagingPicture: false,
  briefDescription: false
};

export default function DamageClaimPage() {
  const [formData, setFormData] = useState({
    issueDescription: '',
    firstName: '',
    lastName: '',
    email: '',
    acceptMarketing: false,
    orderNumber: '',
    deliveryDate: '',
    isAfter48Hours: '',
    damageItemsCount: '',
    hasOriginalPackaging: '',
    termsAcceptedName: ''
  });
  const [checklist, setChecklist] = useState(initialChecklist);
  const [files, setFiles] = useState({
    damagePicture: null,
    closeUpPicture: null,
    serialSkuPicture: null,
    outOfTexasPicture: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChecklistChange = (e) => {
    const { name, checked } = e.target;
    setChecklist((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selected } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: selected?.[0] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));

      payload.append('checklistOrderNumber', checklist.orderNumber);
      payload.append('checklistContactInformation', checklist.contactInformation);
      payload.append('checklistDateOfDeliveryDamageLoss', checklist.dateOfDeliveryDamageLoss);
      payload.append('checklistSerialAndSku', checklist.serialAndSku);
      payload.append('checklistAffectedItemsCount', checklist.affectedItemsCount);
      payload.append('checklistPictures', checklist.pictures);
      payload.append('checklistPackagingPicture', checklist.packagingPicture);
      payload.append('checklistBriefDescription', checklist.briefDescription);

      if (files.damagePicture) payload.append('damagePicture', files.damagePicture);
      if (files.closeUpPicture) payload.append('closeUpPicture', files.closeUpPicture);
      if (files.serialSkuPicture) payload.append('serialSkuPicture', files.serialSkuPicture);
      if (files.outOfTexasPicture) payload.append('outOfTexasPicture', files.outOfTexasPicture);

      await axios.post(`${API_BASE_URL}/damage-claims/create`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Your damage claim has been submitted successfully. Our team will contact you soon.');
      setFormData({
        issueDescription: '',
        firstName: '',
        lastName: '',
        email: '',
        acceptMarketing: false,
        orderNumber: '',
        deliveryDate: '',
        isAfter48Hours: '',
        damageItemsCount: '',
        hasOriginalPackaging: '',
        termsAcceptedName: ''
      });
      setChecklist(initialChecklist);
      setFiles({
        damagePicture: null,
        closeUpPicture: null,
        serialSkuPicture: null,
        outOfTexasPicture: null
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit damage claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="damage-claim-page">
        <section className="damage-claim-hero">
          <h1>Damage Claim</h1>
        </section>

        <section className="damage-claim-form-wrap">
          <form className="damage-claim-form" onSubmit={handleSubmit}>
            <div className="damage-claim-banner">Damage Claim Form</div>
            <div className="damage-claim-logo-wrap">
              <img src="/logo.svg" alt="Luna Furniture" className="damage-claim-logo" />
            </div>

            <h3>Received a damaged item? We are here to help. Please read our policy carefully and submit the form below!</h3>
            <p>
              We understand that sometimes things can go wrong, and an item may arrive damaged. If you receive a damaged
              item, it is important to report it to us as soon as possible, because we have a strict policy in place that
              requires customers to report any damage within 24 hours of delivery.
            </p>

            {message && <div className="damage-claim-success">{message}</div>}
            {error && <div className="damage-claim-error">{error}</div>}

            <div className="damage-claim-group">
              <label htmlFor="issueDescription">Please enter a brief description of the issue *</label>
              <textarea
                id="issueDescription"
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>

            <h2>Contact Information</h2>
            <div className="damage-claim-grid two-col">
              <div className="damage-claim-group">
                <label htmlFor="firstName">First Name *</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
              </div>
              <div className="damage-claim-group">
                <label htmlFor="lastName">Last Name *</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="damage-claim-group">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>

            <label className="damage-claim-inline-check">
              <input
                type="checkbox"
                name="acceptMarketing"
                checked={formData.acceptMarketing}
                onChange={handleInputChange}
              />
              Accept to receive marketing news by email.
            </label>

            <h2>Order Information</h2>
            <div className="damage-claim-grid two-col">
              <div className="damage-claim-group">
                <label htmlFor="orderNumber">Order # *</label>
                <input id="orderNumber" name="orderNumber" value={formData.orderNumber} onChange={handleInputChange} required />
              </div>
              <div className="damage-claim-group">
                <label htmlFor="deliveryDate">Delivery Date *</label>
                <input
                  id="deliveryDate"
                  name="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="damage-claim-group">
              <label>Have 48 hours passed after receiving the delivery? *</label>
              <div className="damage-claim-radio-row">
                <label><input type="radio" name="isAfter48Hours" value="true" checked={formData.isAfter48Hours === 'true'} onChange={handleInputChange} required /> Yes</label>
                <label><input type="radio" name="isAfter48Hours" value="false" checked={formData.isAfter48Hours === 'false'} onChange={handleInputChange} required /> No</label>
              </div>
            </div>

            <h2>Damage Information</h2>
            <div className="damage-claim-group">
              <label htmlFor="damagePicture">Picture of the damage *</label>
              <small>Please submit a wide picture of the item. Maximum file size is 50MB.</small>
              <input id="damagePicture" name="damagePicture" type="file" accept="image/*" onChange={handleFileChange} required />
            </div>

            <div className="damage-claim-group">
              <label htmlFor="closeUpPicture">Close up picture of the damage *</label>
              <small>Please submit a close up picture of the damaged area. Maximum file size is 50MB.</small>
              <input id="closeUpPicture" name="closeUpPicture" type="file" accept="image/*" onChange={handleFileChange} required />
            </div>

            <div className="damage-claim-group">
              <label htmlFor="serialSkuPicture">Serial Number of the Item &amp; SKU Number *</label>
              <small>The serial number is found on packaging label or item back. Maximum file size is 50MB.</small>
              <input id="serialSkuPicture" name="serialSkuPicture" type="file" accept="image/*" onChange={handleFileChange} required />
            </div>

            <div className="damage-claim-group">
              <label htmlFor="damageItemsCount">How many items were damaged? *</label>
              <input
                id="damageItemsCount"
                name="damageItemsCount"
                value={formData.damageItemsCount}
                onChange={handleInputChange}
                placeholder="You can enter a number or text"
                required
              />
            </div>

            <div className="damage-claim-group">
              <label>Do you have the original packaging? *</label>
              <div className="damage-claim-radio-row">
                <label><input type="radio" name="hasOriginalPackaging" value="true" checked={formData.hasOriginalPackaging === 'true'} onChange={handleInputChange} required /> Yes</label>
                <label><input type="radio" name="hasOriginalPackaging" value="false" checked={formData.hasOriginalPackaging === 'false'} onChange={handleInputChange} required /> No</label>
              </div>
            </div>

            <h2>Out Of Texas Orders</h2>
            <div className="damage-claim-group">
              <label htmlFor="outOfTexasPicture">Upload delivery-time pallet/crate picture (optional)</label>
              <input id="outOfTexasPicture" name="outOfTexasPicture" type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="damage-claim-group">
              <label>Optional Checklist if you have submitted all required information</label>
              <div className="damage-claim-checklist">
                <label><input type="checkbox" name="orderNumber" checked={checklist.orderNumber} onChange={handleChecklistChange} /> Order number</label>
                <label><input type="checkbox" name="contactInformation" checked={checklist.contactInformation} onChange={handleChecklistChange} /> Contact information</label>
                <label><input type="checkbox" name="dateOfDeliveryDamageLoss" checked={checklist.dateOfDeliveryDamageLoss} onChange={handleChecklistChange} /> Date of delivery/damage/loss</label>
                <label><input type="checkbox" name="serialAndSku" checked={checklist.serialAndSku} onChange={handleChecklistChange} /> Serial # and SKU</label>
                <label><input type="checkbox" name="affectedItemsCount" checked={checklist.affectedItemsCount} onChange={handleChecklistChange} /> How many items were affected</label>
                <label><input type="checkbox" name="pictures" checked={checklist.pictures} onChange={handleChecklistChange} /> Pictures</label>
                <label><input type="checkbox" name="packagingPicture" checked={checklist.packagingPicture} onChange={handleChecklistChange} /> Packaging picture</label>
                <label><input type="checkbox" name="briefDescription" checked={checklist.briefDescription} onChange={handleChecklistChange} /> Brief description</label>
              </div>
            </div>

            <div className="damage-claim-group">
              <label htmlFor="termsAcceptedName">I have read and understood the terms and conditions *</label>
              <textarea
                className="damage-claim-terms"
                value="By making a purchase from Luna Furniture you acknowledge and agree to our delivery and return policy and related conditions."
                readOnly
                rows={4}
              />
              <input
                id="termsAcceptedName"
                name="termsAcceptedName"
                value={formData.termsAcceptedName}
                onChange={handleInputChange}
                placeholder="Enter your full name/initials"
                required
              />
            </div>

            <div className="damage-claim-submit-wrap">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
