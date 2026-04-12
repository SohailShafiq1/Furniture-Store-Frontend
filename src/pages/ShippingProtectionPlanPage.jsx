import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './ShippingProtectionPlanPage.css';

export default function ShippingProtectionPlanPage() {
  return (
    <>
      <Header />
      <main className="shipping-protection-page">
        <section className="shipping-protection-content" aria-label="Shipping protection plan">
          <h1>Shipping Protection Plan</h1>

          <p>
            Take steps to protect your package against the risk of loss, damage, and theft to guarantee that in the event your delivery does not arrive safely, you can have it repaired, or even replaced if deemed not repairable.
          </p>

          <p>
            The coverage of Shipping Protection commences when your package is dispatched and concludes when the package is delivered to your hands, or if you get in touch with us to report an issue and we resolve it.
          </p>

          <p>The Shipping Protection coverage terminates under the following circumstances:</p>
          <ul>
            <li>When your package is safely delivered to its intended destination without any damage.</li>
            <li>When your package fails to reach its final destination, and you submit a service request, the approval or denial of which determines the continuation of protection.</li>
            <li>For items that incur damage during the shipping process and final delivery, the protection covers damages up to the point of delivery. You have a 10-day window from the date of delivery to initiate a service request. Please be aware that any damages occurring after delivery are not eligible for protection.</li>
          </ul>

          <h2>Service Requests:</h2>
          <p>
            If your package sustains damage, you can initiate a service request as soon as it is delivered. In the case of a lost or stolen package, you can submit a service request 5 days after the estimated delivery date (typically available on the shipping carrier&apos;s tracking site).
          </p>

          <p>
            To file a service request, simply contact us at <a href="mailto:customerservice@lunafurn.com">customerservice@lunafurn.com</a>. When submitting a request, you will be prompted to indicate whether the item(s) in question were lost, stolen, or damaged. If the package contains multiple items, you may need to specify which protected items have been affected.
          </p>

          <p>As part of your service request, we may request additional information and documents, such as:</p>
          <ul>
            <li>Photos depicting the damaged items, the packaging, or the packing materials.</li>
            <li>A police report or video surveillance recordings.</li>
          </ul>

          <p>Failure to provide these documents within 30 days may lead to the denial of your service request.</p>
          <p>If your request is approved, the replacement product will be shipped directly to you or your merchandise will be repaired.</p>

          <h2>Eligibility:</h2>
          <p>Not every item qualifies for the Shipping Protection Plan. The following items are ineligible for protection:</p>
          <ul>
            <li>Items with no monetary value, such as complimentary samples or other items included with your shipment at no cost.</li>
            <li>Items for which shipping labels are printed but never scanned by the carrier, as they were never shipped.</li>
            <li>Digitally delivered items like subscriptions and plans.</li>
          </ul>

          <p>
            In some instances, packages may not be in transit or delivered, or they may be returned to the sender for various reasons. In these cases, the package is still protected. However, the service request may not be approved for the following reasons:
          </p>
          <ul>
            <li>If you provided an incorrect shipping address during the online order. Contact us directly to inquire about address correction and rerouting.</li>
            <li>If the recipient refused to sign for the package or declined the delivery.</li>
            <li>Packages that are not delivered after multiple attempts by the shipping carrier.</li>
            <li>Packages that are held or redirected at the recipient&apos;s request.</li>
            <li>In cases of fraud.</li>
          </ul>

          <h2>Cancellation:</h2>
          <p>
            If you wish to cancel shipping protection and your order has not yet been shipped, please contact us to make the necessary adjustments. Once the order has been shipped, shipping protection is in effect, and a refund cannot be issued. Please note that shipping protection is not transferable to other items that were not initially protected at the time of purchase.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
