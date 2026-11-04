export const privacyUI=`<div class="privacy-links"><a href="/privacy/">Privacy</a><a href="/cookies/">Cookies</a><a href="/legal/">Company information</a><a href="/data-requests/">Your data rights</a><button type="button" data-cookie-settings>Customize cookies</button></div><div class="quick-actions" aria-label="Quick contact"><a class="btn primary quick-quote" href="/request-a-quote/">Get a quote ↗</a><a class="btn outline mobile-email" href="mailto:info@zufek.net">Email us</a></div><button class="back-top" aria-label="Back to top" hidden>↑</button><section class="cookie-notice" aria-label="Cookie choices" hidden><strong>Your privacy choices</strong><p>We use necessary storage to remember your preferences. Optional analytics is enabled only with your consent. We do not use advertising trackers. Website access records, including your full IP address, are collected separately from these choices. <a href="/cookies/">Cookie details</a></p><div class="button-row"><button class="btn primary" data-cookie-accept>Accept all</button><button class="btn outline" data-cookie-reject>Reject optional</button><button class="btn outline" data-cookie-settings>Customize cookies</button></div></section><dialog id="cookie-dialog" aria-labelledby="cookie-title"><h2 id="cookie-title">Customize cookies</h2><p>Choose how this website uses optional storage. You can change your choice at any time.</p><label class="cookie-category"><span><strong>Necessary</strong><small>Stores your privacy choice and supports essential functionality. Always active.</small></span><input type="checkbox" checked disabled aria-label="Necessary, always active"></label><label class="cookie-category"><span><strong>Analytics</strong><small>Helps us understand page visits and inquiry sources. Enabled only with your consent. Website access records, including full IP addresses, are collected separately as described in the privacy notice.</small></span><input type="checkbox" id="consent-analytics" aria-label="Allow analytics"></label><label class="cookie-category"><span><strong>Marketing</strong><small>Not currently used. No advertising pixels are installed.</small></span><input type="checkbox" disabled aria-label="Marketing not currently used"></label><p class="fine">Your preferences are saved in this browser for 180 days. You can change or withdraw consent at any time. Withdrawal stops optional analytics and removes source information stored in your browser. Website access records are managed separately; contact us to exercise your privacy rights.</p><a href="/cookies/">Read the cookie policy</a><div class="button-row"><button class="btn primary" data-cookie-save>Save preferences</button><button class="btn outline" data-cookie-reject>Reject optional</button><button class="btn outline" data-cookie-close>Close</button></div></dialog>`;

export function registerPrivacy({add, heading}) {
  const page = (url, title, intro, body) =>
    add(
      url,
      title,
      intro,
      heading('ZUFEK / PRIVACY & COMPANY INFORMATION', title, intro) +
      `<section class="section compact policy-copy">
        <p class="fine">Last updated: 4 November 2026</p>
        ${body}
      </section>`,
      {noindex: true}
    );

  // 1. PRIVACY NOTICE
  page('/privacy/', 'Privacy notice',
    'How ZUFEK collects, uses, stores and protects personal information.',
    `<h2>1. Who is responsible for your personal data?</h2>
    <p><strong>DONGGUAN ZUFEK PRECISION CO., LTD.</strong> is the controller of the personal data described in this notice, where it determines the purposes and means of processing.</p>
    <p><strong>Registered address:</strong> 1st Floor, No. 353, Fuyuan District, Songmushan, Dalang Town, Dongguan City, Guangdong, China.</p>
    <p><strong>Privacy contact:</strong> <a href="mailto:info@zufek.net">info@zufek.net</a>. Contact us for privacy questions or requests concerning your personal data.</p>
    <p>Where applicable, this notice is intended to provide information required by the EU General Data Protection Regulation (GDPR) and other applicable data protection laws. The GDPR may apply when we offer goods or services to individuals in the EU or monitor behaviour taking place in the EU.</p>

    <h2>2. Personal data we collect</h2>
    <p>Depending on how you use our website, we may collect:</p>
    <ul>
      <li><strong>Contact information:</strong> name, business email address, company, job title and telephone number where provided.</li>
      <li><strong>Inquiry information:</strong> message content, selected products, quantities, technical requirements and project details.</li>
      <li><strong>Technical files:</strong> drawings, specifications and other files you voluntarily submit.</li>
      <li><strong>Business communications:</strong> correspondence, quotation history, project discussions and relevant business records.</li>
      <li><strong>Technical information:</strong> IP address, pages visited, timestamps, referral source, approximate country, browser and device information.</li>
      <li><strong>Cookie preferences:</strong> your choices regarding optional analytics and website storage.</li>
    </ul>
    <p>Please do not submit sensitive personal data or unrelated personal information about other individuals. Remove unnecessary personal information from drawings and project files where possible.</p>

    <h2>3. Why we process your information and our legal bases</h2>
    <p>We process personal data only where an applicable legal basis permits us to do so. Depending on the circumstances, these bases include:</p>
    <ul>
      <li><strong>Pre-contractual steps:</strong> reviewing your requirements, assessing technical feasibility, preparing quotations and discussing potential orders at your request.</li>
      <li><strong>Contract performance:</strong> processing orders, providing agreed services, communicating about delivery and managing business transactions.</li>
      <li><strong>Legitimate interests:</strong> responding to B2B inquiries, maintaining business relationships, securing our website, preventing abuse and improving our services. We balance these interests against your rights and freedoms.</li>
      <li><strong>Consent:</strong> operating optional analytics and non-essential cookies where consent is legally required. You may withdraw your consent at any time.</li>
      <li><strong>Legal obligations:</strong> complying with applicable accounting, tax, regulatory and other legal requirements, and establishing, exercising or defending legal claims.</li>
    </ul>
    <p>Submitting an inquiry does not automatically subscribe you to marketing emails. We do not treat an inquiry as marketing consent. Where marketing consent is required, it will be requested separately.</p>
    <p>You may object to processing based on legitimate interests where applicable.</p>

    <h2>4. Drawings and project confidentiality</h2>
    <p>Drawings and technical files are used to assess your requirements, prepare quotations and support the relevant project. Access is restricted to personnel and service providers who need the information for these purposes.</p>
    <p>Please upload only files you are authorised to share. If your project requires an NDA or a specific confidentiality arrangement, contact us before submitting restricted information.</p>

    <h2>5. Cookies and analytics</h2>
    <p>We use essential browser storage to support website functions and remember your privacy preferences.</p>
    <p>Optional first-party analytics is disabled by default and will only be activated after you provide consent. We do not use advertising pixels or advertising tracking on this website.</p>
    <p>Where required by applicable European privacy and electronic communications laws, we will obtain your consent before using non-essential cookies or similar technologies.</p>
    <p>You can accept or reject optional analytics and change or withdraw your consent at any time through the cookie settings in the website footer. See our <a href="/cookies/">Cookie &amp; storage policy</a>.</p>

    <h2>6. Server access logs and website security</h2>
    <p>When you visit public pages, our hosting and website systems may record your full IP address, pages visited, visit time, referral source, limited campaign information, approximate country and browser or device type.</p>
    <p>We use these records to investigate abuse, resolve technical faults, protect the website and understand inquiry sources. These security logs are separate from optional analytics and are collected as part of operating and protecting the website.</p>
    <p>Where the GDPR applies, this processing is based on our legitimate interests in website security and business operations, taking account of your rights and interests.</p>
    <p>A daily rotating identifier may be used to estimate traffic without creating a persistent visitor profile. Access is restricted to authorised personnel. Access records and IP addresses linked to inquiries are currently configured to be removed within 90 days. Backups may follow separate retention arrangements.</p>

    <h2>7. Who may receive your personal data?</h2>
    <p>Your personal data may be accessed by authorised ZUFEK employees and service providers supporting website hosting, data storage, security, IT maintenance and business email delivery.</p>
    <p>These service providers may process information only as necessary to provide their services and subject to appropriate confidentiality and data protection obligations.</p>
    <p>We do not sell your personal data. Information may also be disclosed where required by law, to competent authorities where legally required, or where necessary to establish, exercise or defend legal claims or protect our rights.</p>

    <h2>8. International data transfers</h2>
    <p>DONGGUAN ZUFEK PRECISION CO., LTD. is established in China. Personal data submitted through this website may therefore be accessed and processed by our team in China. Our service providers may also process information in other countries, depending on their locations and service arrangements.</p>
    <p>Where the GDPR applies, we take the international data transfer requirements of Chapter V into account.</p>
    <p>Where a transfer is subject to these requirements and no adequacy decision applies, an appropriate transfer mechanism may be required, such as the European Commission's Standard Contractual Clauses (SCCs), together with any necessary transfer impact assessment and supplementary measures.</p>
    <p>You may contact <a href="mailto:info@zufek.net">info@zufek.net</a> for further information about the processing locations and applicable transfer safeguards.</p>

    <h2>9. Data retention</h2>
    <p>We retain personal data only for as long as reasonably necessary for the purposes described in this notice, taking account of legal, accounting, contractual and dispute resolution requirements.</p>
    <ul>
      <li><strong>Inactive inquiries:</strong> reviewed after 12 months. Information no longer needed is deleted or anonymised unless a longer retention period is legally necessary.</li>
      <li><strong>Orders and business relationships:</strong> retained for the duration of the relationship and any additional period required by applicable legal obligations or necessary to defend legal claims.</li>
      <li><strong>Drawings and technical files:</strong> generally follow the retention period of the related inquiry or business relationship.</li>
      <li><strong>Security logs:</strong> retained according to the periods described in the server access logs section.</li>
      <li><strong>Optional analytics:</strong> aggregate statistics are retained for up to 90 days under our current configuration.</li>
      <li><strong>Backups:</strong> may remain in backup systems for a limited period according to applicable backup rotation and deletion arrangements.</li>
    </ul>

    <h2>10. Your data protection rights</h2>
    <p>Where the GDPR applies, you may have the following rights, subject to applicable legal conditions and exceptions:</p>
    <ul>
      <li><strong>Right of access:</strong> request a copy of your personal data.</li>
      <li><strong>Right to rectification:</strong> request correction of inaccurate or incomplete information.</li>
      <li><strong>Right to erasure:</strong> request deletion of your personal data.</li>
      <li><strong>Right to restriction:</strong> request restriction of certain processing activities.</li>
      <li><strong>Right to data portability:</strong> receive certain personal data in a structured, commonly used and machine-readable format, where applicable.</li>
      <li><strong>Right to object:</strong> object to processing based on legitimate interests on grounds relating to your particular situation.</li>
      <li><strong>Right to withdraw consent:</strong> withdraw consent at any time where processing is based on consent.</li>
      <li><strong>Right to complain:</strong> lodge a complaint with a competent data protection supervisory authority in the EU/EEA.</li>
    </ul>
    <p>These rights are not absolute and may be subject to legal conditions and exceptions.</p>
    <p>We do not make decisions based solely on automated processing, including profiling, that produce legal effects or similarly significant effects in connection with website inquiries.</p>
    <p>To exercise your rights, please visit our <a href="/data-requests/">Data Request page</a> or email <a href="mailto:info@zufek.net">info@zufek.net</a>.</p>
    <p>Where the GDPR applies, we generally respond within one month. For complex or numerous requests, this period may be extended by up to two further months where legally permitted. We will inform you of any extension and the reasons within the initial one-month period.</p>
    <p>We may request proportionate information to verify your identity before fulfilling a request.</p>

    <h2>11. Providing personal data</h2>
    <p>You are generally free to decide whether to submit an inquiry. However, if you do not provide information necessary to understand your requirements or contact you, we may be unable to assess your project, respond fully or prepare a quotation.</p>

    <h2>12. Data security</h2>
    <p>We use technical and organisational measures, including access controls, to help protect personal data and project files against unauthorised access, loss, alteration or misuse.</p>
    <p>Access is limited to authorised personnel who need the information for their work. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>

    <h2>13. Children</h2>
    <p>This website and our services are intended for business and professional use, not for children. We do not knowingly seek to collect personal data from children.</p>

    <h2>14. Changes to this notice</h2>
    <p>We may update this notice when our processing activities, services or legal requirements change. The latest revision date appears at the top of this page.</p>`
  );

  // 2. COOKIE POLICY
  page('/cookies/', 'Cookie & storage policy',
    'Understand the essential storage used by this website and control optional first-party analytics.',
    `<h2>1. What we use</h2>
    <p>This website uses essential browser storage to provide basic functions and remember your privacy choices.</p>
    <p>Optional first-party analytics is disabled by default and is activated only after you provide consent. We do not use advertising pixels or advertising trackers.</p>
    <p>Where applicable law requires consent for non-essential cookies or similar technologies, we will request consent before activating them.</p>
    <p>You can reject optional analytics as easily as you can accept it, and you can change or withdraw your choice at any time through the cookie settings in the website footer.</p>

    <h2>2. Cookies and browser storage</h2>
    <table>
      <thead>
        <tr><th>Storage</th><th>Purpose and duration</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>zufek_privacy_v2<br>First-party localStorage</td>
          <td>Remembers essential and analytics choices, policy version and expiry. Does not contain inquiry content. The application currently sets an expiry of 180 days. It is overwritten when you save preferences.</td>
        </tr>
        <tr>
          <td>zufek_analytics<br>First-party cookie</td>
          <td>Stores a value indicating whether analytics is allowed so the website can enforce your choice. Current configured lifetime: up to 180 days; SameSite=Lax and Secure on HTTPS.</td>
        </tr>
        <tr>
          <td>zufek_attribution_v1<br>First-party sessionStorage</td>
          <td>With analytics consent only, remembers the landing page, referral domain and limited campaign parameters during the current browser tab session. Cleared on withdrawal and when the tab session ends.</td>
        </tr>
        <tr>
          <td>Hosting sign-in session</td>
          <td>The hosting platform may use necessary authentication cookies when sign-in is required, including restricted previews and administration. Names and durations depend on its configuration.</td>
        </tr>
        <tr>
          <td>zufek_language<br>First-party localStorage</td>
          <td>Remembers your manually selected language until browser storage is cleared. Used only as a display preference.</td>
        </tr>
        <tr>
          <td>zufek_language_visit<br>First-party sessionStorage</td>
          <td>Prevents repeated automatic language switching during the current tab session. Not used for analytics or visitor identification.</td>
        </tr>
      </tbody>
    </table>

    <p>The inquiry retry identifier exists in page memory and is not a tracking cookie. Contact fields and drawings are not saved to localStorage.</p>
    <p>Optional attribution storage is used only after analytics consent. Server-side inquiry records and access logs are described in our <a href="/privacy/">Privacy notice</a>.</p>

    <h2>3. Your cookie choices</h2>
    <p>Use the following control to review or change your preferences:</p>
    <p><button class="btn outline" data-cookie-settings>Customize cookies</button></p>
    <ul>
      <li><strong>Accept all:</strong> enables the optional first-party analytics currently offered by this website.</li>
      <li><strong>Reject optional:</strong> keeps optional analytics disabled while allowing essential website storage.</li>
      <li><strong>Save preferences:</strong> applies your selected choices.</li>
    </ul>
    <p>You can withdraw analytics consent at any time through the footer cookie settings. Withdrawal does not affect processing carried out before consent was withdrawn.</p>
    <p>You can also clear browser storage through your browser settings. Blocking all storage may affect essential website functions.</p>

    <h2>4. Third-party services</h2>
    <p>Our current website configuration does not intentionally use advertising pixels or embedded third-party videos. Fonts use the browser's local system fonts rather than requesting Google Fonts.</p>
    <p>If we introduce services that place or access non-essential cookies or similar technologies, this policy and the consent controls will be updated before those technologies are activated where consent is required.</p>

    <h2>5. Contact</h2>
    <p>For questions about cookies, analytics or privacy choices, contact <a href="mailto:info@zufek.net">info@zufek.net</a>.</p>
    <p>See our <a href="/privacy/">Privacy notice</a> for further information about personal data processing and your rights.</p>`
  );

  // 3. DATA REQUESTS
  page('/data-requests/', 'Your data rights',
    'How to contact ZUFEK to exercise your data protection rights.',
    `<h2>1. Submit a request</h2>
    <p>Email <a href="mailto:info@zufek.net?subject=Privacy%20request">info@zufek.net</a> with the subject "Privacy request".</p>
    <p>You may request:</p>
    <ul>
      <li>Access to your personal data.</li>
      <li>Correction of inaccurate or incomplete information.</li>
      <li>Deletion of personal data.</li>
      <li>Restriction of processing.</li>
      <li>Data portability where applicable.</li>
      <li>Objection to processing based on legitimate interests.</li>
      <li>Withdrawal of consent where processing is based on consent.</li>
    </ul>
    <p>Include your inquiry reference, if available, and the email address used for the inquiry. Please describe your request clearly.</p>
    <p>Do not send passwords, payment-card details or identity documents unless we explain why a proportionate verification step is necessary.</p>

    <h2>2. How we handle your request</h2>
    <p>We will review your request, verify that it relates to you where reasonably necessary, and consider the applicable legal conditions and exceptions.</p>
    <p>Where the GDPR applies, we generally respond within one month of receiving your request.</p>
    <p>For complex or numerous requests, this period may be extended by up to two further months where legally permitted. If an extension is needed, we will inform you within the initial one-month period and explain the reasons.</p>
    <p>If we cannot take action, we will explain the reasons and, where required, inform you of your right to complain to a supervisory authority and seek a judicial remedy.</p>
    <p>Some information may need to be retained to comply with legal obligations or to establish, exercise or defend legal claims.</p>

    <h2>3. Your right to complain</h2>
    <p>Where the GDPR applies, you may lodge a complaint with a competent data protection supervisory authority, particularly in the EU/EEA country where you live, work or where you believe an infringement occurred.</p>

    <h2>4. More information</h2>
    <p>Our <a href="/privacy/">Privacy notice</a> explains what information we collect, why we use it, how long we retain it and how to contact us.</p>
    <p>Exercising your data protection rights does not require you to make a purchase or subscribe to marketing.</p>`
  );

  // 4. COMPANY INFORMATION
  page('/legal/', 'Company information',
    'Company and contact information for ZUFEK custom metal fasteners.',
    `<h2>DONGGUAN ZUFEK PRECISION CO., LTD.</h2>
    <p>Established in 2005.</p>
    <p><strong>Registered address:</strong><br>
    1st Floor, No. 353, Fuyuan District, Songmushan, Dalang Town, Dongguan City, Guangdong, China</p>
    <p><strong>Business:</strong> custom non-standard metal screws and fasteners.</p>
    <p><strong>Contact:</strong> <a href="mailto:info@zufek.net">info@zufek.net</a>.</p>

    <h2>Technical information and quotations</h2>
    <p>Website content provides general engineering and procurement guidance. Final material, tolerances, manufacturing route, testing, price and delivery are subject to drawing review and written agreement.</p>
    <p>Submitting an inquiry does not constitute acceptance of an order.</p>

    <h2>Project confidentiality</h2>
    <p>Only upload information you are authorised to share. If your project requires an NDA or a particular data-handling arrangement, contact us before sending restricted drawings.</p>

    <h2>Privacy</h2>
    <p>For information about personal data processing and your data protection rights, please read our <a href="/privacy/">Privacy notice</a> and <a href="/cookies/">Cookie &amp; storage policy</a>, or contact <a href="mailto:info@zufek.net">info@zufek.net</a>.</p>`
  );
}
