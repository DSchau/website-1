import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { HelmetDatoCms } from 'gatsby-source-datocms';
import { StaticQuery, graphql } from 'gatsby';

import CookieConsent from 'react-cookie-consent';
import Navbar from 'components/Navbar';
import MobileNavbar from 'components/MobileNavbar';
import Footer from 'components/Footer';

import './style.sass';

const query = graphql`
  query LayoutQuery {
    site: datoCmsSite {
      faviconMetaTags {
        ...GatsbyDatoCmsFaviconMetaTags
      }
    }
  }
`;

class TemplateWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { chatOpen: false };
  }

  componentDidMount() {
    if (window.kayako) {
      return;
    }

    window.kayako = {};
    window.kayako.readyQueue = [
      () => {
        window.kayako.on('chat_window_maximized', () =>
          this.setState({ chatOpen: true }),
        );
        window.kayako.on('chat_window_minimized', () =>
          this.setState({ chatOpen: false }),
        );
      },
    ];
    window.kayako.newEmbedCode = true;

    window.kayako._settings = {
      apiUrl: 'https://datocms.kayako.com/api/v1',
      messengerUrl: 'https://datocms.kayakocdn.com/messenger',
      realtimeUrl: 'wss://kre.kayako.net/socket',
      hideLauncher: true,
    };

    const script = document.createElement('script');
    script.async = false;
    script.type = 'text/javascript';
    script.src = window.kayako._settings.messengerUrl;
    script.crossOrigin = 'anonymous';

    document.body.appendChild(script);
  }

  handleKayakoToggle(e) {
    e.preventDefault();

    if (window.kayako.visibility() === 'minimized') {
      window.kayako.maximize();
    } else {
      window.kayako.minimize();
    }
  }

  render() {
    const { hideChat, children, home } = this.props;

    return (
      <StaticQuery
        query={query}
        render={data => (
          <div className={home ? 'Layout--homepage' : 'Layout'}>
            <Helmet title="DatoCMS">
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
              />
              <meta
                name="google-site-verification"
                content="wfOsq57h3qCQUTbHcX-4qEEY07vgi4KgH9rdT1ywwwc"
              />
              <meta name="theme-color" content="#5a3252" />
            </Helmet>
            <HelmetDatoCms favicon={data.site.faviconMetaTags} />
            <CookieConsent
              cookieName="cookies-accepted"
              location="bottom"
              onAccept={() => {}}
              acceptOnScroll
              acceptOnScrollPercentage={10}
              disableStyles
            >
              We use cookies to help our site work and to understand how it is
              used. By continuing to browse the site you're agreeing to
              our&nbsp;
              <a
                href="https://www.iubenda.com/privacy-policy/64648824/cookie-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                use of cookies
              </a>
              .
            </CookieConsent>
            <Navbar transparent={this.props.home} />
            <MobileNavbar />
            {children}
            <Footer />
            {!hideChat && (
              <button
                className={`chat-support is-${
                  this.state.chatOpen ? 'open' : 'closed'
                }`}
                onClick={this.handleKayakoToggle.bind(this)}
              />
            )}
          </div>
        )}
      />
    );
  }
}

TemplateWrapper.propTypes = {
  children: PropTypes.array,
};

export default TemplateWrapper;
