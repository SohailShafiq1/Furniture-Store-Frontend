import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './PrivacyPolicyPage.css';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="privacy-policy-page">
        <section className="policy-hero">
          <div className="policy-hero-content">
            <h1>Privacy Policy</h1>
            <p>PRIVACY STATEMENT</p>
          </div>
        </section>

        <section className="policy-content">
          <div className="policy-inner">
            <h2>SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?</h2>
            <p>
              When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address.
            </p>
            <p>
              When you browse our store, we also automatically receive your computer’s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.
            </p>
            <p>
              Email marketing (if applicable): With your permission, we may send you emails about our store, new products and other updates.
            </p>

            <h2>SECTION 2 - CONSENT</h2>
            <p><strong>How do you get my consent?</strong></p>
            <p>
              When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.
            </p>
            <p>
              If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.
            </p>
            <p><strong>How do I withdraw my consent?</strong></p>
            <p>
              If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at anytime, by contacting us at info@lunafurn.com or mailing us at:
            </p>
            <address>
              Dimond Moder Furniture<br />
              7010 Harwin Dr.<br />
              Houston Texas US 77036
            </address>

            <h2>SECTION 3 - DISCLOSURE</h2>
            <p>
              We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.
            </p>

            <h2>SECTION 4 - SHOPIFY</h2>
            <p>
              Our store is hosted on Shopify Inc. They provide us with the online e-commerce platform that allows us to sell our products and services to you.
            </p>
            <p>
              Your data is stored through Shopify’s data storage, databases and the general Shopify application. They store your data on a secure server behind a firewall.
            </p>
            <p><strong>Payment:</strong></p>
            <p>
              If you choose a direct payment gateway to complete your purchase, then Shopify stores your credit card data. It is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS). Your purchase transaction data is stored only as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is deleted.
            </p>
            <p>
              All direct payment gateways adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, Mastercard, American Express and Discover.
            </p>
            <p>
              PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.
            </p>
            <p>
              For more insight, you may also want to read Shopify’s Terms of Service (<a href="https://www.shopify.com/legal/terms" target="_blank" rel="noreferrer">https://www.shopify.com/legal/terms</a>) or Privacy Statement (<a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noreferrer">https://www.shopify.com/legal/privacy</a>).
            </p>

            <h2>SECTION 5 - THIRD-PARTY SERVICES</h2>
            <p>
              In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.
            </p>
            <p>
              However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions.
            </p>
            <p>
              For these providers, we recommend that you read their privacy policies so you can understand the manner in which your personal information will be handled by these providers.
            </p>
            <p>
              In particular, remember that certain providers may be located in or have facilities that are located in a different jurisdiction than either you or us. So if you elect to proceed with a transaction that involves the services of a third-party service provider, then your personal information used in completing that transaction may become subject to disclosure under the laws of the jurisdiction(s) in which that service provider or its facilities are located.
            </p>
            <p>
              As an example, if you are located in Canada and your transaction is processed by a payment gateway located in the United States, then your personal information used in completing that transaction may be subject to disclosure under United States legislation, including the Patriot Act.
            </p>
            <p>
              Once you leave our store’s website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website’s Terms of Service.
            </p>

            <h2>Links</h2>
            <p>
              When you click on links on our store, they may direct you away from our site. We are not responsible for the privacy practices of other sites and encourage you to read their privacy statements.
            </p>

            <h2>SECTION 6 - SECURITY</h2>
            <p>
              To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.
            </p>
            <p>
              If you provide us with your credit card information, the information is encrypted using secure socket layer technology (SSL) and stored with AES-256 encryption. Although no method of transmission over the Internet or electronic storage is 100% secure, we follow all PCI-DSS requirements and implement additional generally accepted industry standards.
            </p>

            <h2>SECTION 7 - COOKIES</h2>
            <p>
              Here is a list of cookies that we use. We’ve listed them here so that you can choose if you want to opt-out of cookies or not.
            </p>
            <ul>
              <li><strong>_session_id</strong>, unique token, sessional, Allows Shopify to store information about your session (referrer, landing page, etc).</li>
              <li><strong>_shopify_visit</strong>, no data held, Persistent for 30 minutes from the last visit, Used by our website provider’s internal stats tracker to record the number of visits.</li>
              <li><strong>_shopify_uniq</strong>, no data held, expires midnight (relative to the visitor) of the next day, Counts the number of visits to a store by a single customer.</li>
              <li><strong>cart</strong>, unique token, persistent for 2 weeks, Stores information about the contents of your cart.</li>
              <li><strong>_secure_session_id</strong>, unique token, sessional.</li>
              <li><strong>storefront_digest</strong>, unique token, indefinite If the shop has a password, this is used to determine if the current visitor has access.</li>
            </ul>

            <h2>SECTION 8 - AGE OF CONSENT</h2>
            <p>
              By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.
            </p>

            <h2>SECTION 9 - CHANGES TO THIS PRIVACY POLICY</h2>
            <p>
              We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.
            </p>
            <p>
              If our store is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.
            </p>

            <h2>QUESTIONS AND CONTACT INFORMATION</h2>
            <p>
              If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact our Privacy Compliance Officer at info@lunafurn.com or by mail at
            </p>
            <address>
              Dimond Moder Furniture<br />
              [Re: Privacy Compliance Officer]<br />
              7010 Harwin Dr.<br />
              Houston Texas US 77036<br />
              info@lunafurn.com
            </address>

            <h2>SMS/MMS MOBILE MESSAGING MARKETING PROGRAM</h2>
            <p>
              We respect your privacy. We will only use information you provide through the Program to transmit your mobile messages and respond to you, if necessary. This includes, but is not limited to, sharing information with platform providers, phone companies, and other vendors who assist us in the delivery of mobile messages. WE DO NOT SELL, RENT, LOAN, TRADE, LEASE, OR OTHERWISE TRANSFER FOR PROFIT ANY PHONE NUMBERS OR CUSTOMER INFORMATION COLLECTED THROUGH THE PROGRAM TO ANY THIRD PARTY. Nonetheless, We reserve the right at all times to disclose any information as necessary to satisfy any law, regulation or governmental request, to avoid liability, or to protect Our rights or property. When you complete forms online or otherwise provide Us information in connection with the Program, you agree to provide accurate, complete, and true information. You agree not to use a false or misleading name or a name that you are not authorized to use. If, in Our sole discretion, We believe that any such information is untrue, inaccurate, or incomplete, or you have opted into the Program for an ulterior purpose, We may refuse you access to the Program and pursue any appropriate legal remedies.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
