import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './CareersPage.css';

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="careers-page">
        <section className="careers-hero" aria-label="Careers hero section">
          <h1>Careers</h1>
          <img src="/career.png" alt="We are hiring" className="careers-hero-image" />
        </section>

        <section className="careers-description" aria-label="Job details">
          <h2>Job Position: Web Developer (Stafford, TX)</h2>
          <p className="careers-posting-date">Job Posting Date: 02/07/2025</p>

          <p>
            Web Developer will create, develop, and maintain web applications or websites;
            ensure the integrity of their code by validating its structure, adherence to industry
            standards, and compatibility with the company&apos;s technology and operating systems;
            oversee updates for website content, select appropriate programming languages, design
            tools, and applications; implement backup protocols for website files to local
            directories for recovery purposes; conduct software performance testing, gather
            pertinent information from relevant sources, and collaborate effectively with
            management and users to devise e-commerce strategies.
          </p>

          <p>
            Bachelor&apos;s degree in Computer Science, Software Engineering or Programming is
            required. Send resume to Irfan Demir, General Manager, 4655 Wright RD, Ste 140,
            Stafford, TX 77477-4133.
          </p>
        </section>

        <section className="careers-contact" aria-label="Resume submission details">
          <p className="careers-contact-title">Send Resume to</p>
          <table className="careers-contact-table">
            <tbody>
              <tr>
                <td>Irfan Demir | info@lunafurn.com</td>
                <td>4655 Wright Rd, Ste 140</td>
              </tr>
              <tr>
                <td>General Manager</td>
                <td>Stafford, TX</td>
              </tr>
              <tr>
                <td>832 900 3800</td>
                <td>77477-4133</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
      <Footer />
    </>
  );
}
