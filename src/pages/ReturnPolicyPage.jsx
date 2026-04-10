import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './ReturnPolicyPage.css';

export default function ReturnPolicyPage() {
  return (
    <>
      <Header />
      <main className="return-policy-page">
        <div className="return-policy-container">
          <h1>Return Policy</h1>
          <section>
            <h2>CANCELLATIONS AND REFUNDS</h2>
            <p><strong>Timeframe for Cancellation:</strong></p>
            <p>
              To ensure prompt order processing, cancellations must be made within 48 hours of placing your order. You can cancel by contacting us at <strong>(832) 900-3800</strong>.
            </p>
            <p><strong>Order Confirmation and Payment:</strong></p>
            <p>
              After placing your order, a Luna Furniture representative will email you to confirm details and verify accuracy. Your payment will be processed after you confirm or 48 hours after the initial transaction, whichever comes first.
            </p>
            <p><strong>Cancellation Fees:</strong></p>
            <ul>
              <li>Within 24 hours: Full refund, no fees. Exclusions apply if the item is in the warehouse or in transit.</li>
              <li>After 24 hours: 3% non-negotiable payment processing fee.</li>
              <li>Products in Luna Furniture's possession, in transit (to Luna Furniture's warehouse or to your address), or ready for delivery: 70% refund (covers processing, picking, and handling). Delivery fees are non-refundable.</li>
              <li>Products not ready for delivery: 97% refund (if payment captured) or 100% refund (if payment not captured).</li>
            </ul>
            <p><strong>Special Orders and Shipped Items:</strong></p>
            <p>
              Backordered items: If you choose to wait for backordered items, your order becomes a non-cancellable "special order." Shipped items cannot be cancelled once shipped. A 30% restocking fee and return shipping costs may apply.
            </p>
            <p><strong>Merchant's Inability to Meet ETA:</strong></p>
            <p>
              Full refund (minus 3% fee) if the order is cancelled due to the merchant's inability to meet the estimated time of arrival (ETA), and the item is not in transit to Luna Furniture's warehouse or your residence. A 30% cancellation fee applies if the item is in transit.
            </p>
            <p><strong>Refunds:</strong></p>
            <p>
              Refunds will be issued to the original payment method. Refunds may take time to process depending on your financial institution.
            </p>
            <p><strong>Ownership and Return of Merchandise:</strong></p>
            <p>
              If a refund or chargeback is issued, ownership of the merchandise automatically reverts to the merchant. You are responsible for returning the merchandise in its original condition and assisting with the return process. Failure to return the merchandise may result in legal action.
            </p>
          </section>

          <section>
            <h2>RETURNS</h2>
            <p>
              We strive for your complete satisfaction with every purchase. If you are not happy with your order, you may return eligible items within 30 days of delivery for a refund, subject to the following conditions:
            </p>
            <p><strong>Eligibility Requirements:</strong></p>
            <ul>
              <li>You have 30 days from the date of delivery to initiate a return.</li>
              <li>Items must be in new, unused condition and in their original packaging with all accessories.</li>
              <li>Items should be unassembled and unmodified.</li>
              <li>A Return Merchandise Authorization (RMA) number must be obtained before returning any item. Contact us via email to request an RMA.</li>
            </ul>
            <p><strong>Exclusions:</strong></p>
            <ul>
              <li>Final Sale or Special Order items</li>
              <li>Mattresses, foundations, bedding, linens</li>
              <li>Individual portions of sectionals</li>
              <li>Cordless power packs</li>
            </ul>
            <p><strong>Refunds and Fees:</strong></p>
            <ul>
              <li>Restocking Fee: A 30% restocking fee applies to returned items.</li>
              <li>Return Shipping: You are responsible for return shipping costs. We can arrange a pickup for an estimated fee of $2.50 per pound.</li>
              <li>Additional Fees: Fees may apply for missing parts, refused deliveries, or invalid addresses.</li>
            </ul>
            <p><strong>Return Process:</strong></p>
            <p>
              Returned items must reach us within 20 days from the RMA issuance date. Restocking fees and delivery charges will be calculated and communicated in writing or email. Refunds will be processed after inspection by our team or an authorized third-party agent.
            </p>
            <p><strong>Full Refunds May Not Be Issued If:</strong></p>
            <ul>
              <li>The item has been used, damaged, or altered.</li>
              <li>The item is not returned in its original packaging.</li>
              <li>The RMA number is missing.</li>
              <li>The item is damaged due to shipper mishandling (in this case, file a claim with the shipping carrier).</li>
            </ul>
          </section>

          <section>
            <h2>Damaged Items</h2>
            <p>
              We understand that sometimes things can go wrong, and an item may arrive damaged. It is important to report any damage within 24 hours of delivery. We are unable to process claims reported after 48 hours of delivery.
            </p>
            <p>
              Please inspect your items as soon as they arrive and notify us immediately. If a product is damaged and deemed fixable by our manufacturer, we will assign a technician to your residence to repair the item at no cost to you. We cannot accommodate a return or exchange if the item is deemed fixable by our manufacturer.
            </p>
            <p>
              Keep the original packaging of damaged merchandise because it is required if the manufacturer accepts a replacement.
            </p>
          </section>

          <section>
            <p>
              We appreciate your understanding of our return policy. Our goal is to make your shopping experience as seamless as possible. This policy is subject to change. We encourage you to review it periodically. For any questions or concerns, please contact us at <strong>(832) 900-3800</strong>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
