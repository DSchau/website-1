import React from 'react'
import Link from 'gatsby-link'
import { Link as ScrollLink, Element } from 'react-scroll'

import './style.sass'
import { Wrap, button, Space, text } from 'blocks'

import Browser from 'components/Browser'
import bem from 'utils/bem'

import screenshot from 'images/screen.png'
import arrowDown from 'images/arrow-down-dropdown.svg'

const b = bem.lock('HomeHero')

const HomeHero = ({ title, description }) => (
  <div>
    <div className={b()}>
      <div className={b('inner')}>
        <div className={b('text-container')}>
          <div>
            <h1 className={b('title')}>
              {title}
            </h1>
            <div className={b('description')}>
              {description}
            </div>
            <Space bottom="2">
              <a href="https://dashboard.datocms.com/register" className={button({ red: true })}>
                Try it free
              </a>
              <ScrollLink
                href="#"
                to="discover"
                className={b('or-discover')}
                smooth
                duration={500}
                offset={-50}
              >
                or discover more <img src={arrowDown} />
              </ScrollLink>
            </Space>
            <p className={text({ size: 'small' })}>
              No credit card required, 30 seconds sign-up.
            </p>
          </div>
        </div>
        <div className={b('browser')}>
          <Browser small title="DatoCMS">
            <video autoPlay loop muted playsInline>
              <source src="https://res.cloudinary.com/dato/video/upload/v1517927739/ScreenFlowSlow_p0kvjw.webm" type="video/webm" />
              <source src="https://res.cloudinary.com/dato/video/upload/v1517927739/ScreenFlowSlow_p0kvjw.mp4" type="video/mp4" />
              <source src="https://res.cloudinary.com/dato/video/upload/v1517927739/ScreenFlowSlow_p0kvjw.ogv" type="video/ogg" />
            </video>
          </Browser>
        </div>
      </div>
    </div>
    <Element name="discover" />
  </div>
)

export default HomeHero


