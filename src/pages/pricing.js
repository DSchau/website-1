import React from 'react';
import { graphql } from 'gatsby';
import { HelmetDatoCms } from 'gatsby-source-datocms';

import bem from 'utils/bem';
import { button } from 'blocks';

import Layout from 'components/Layout';
import PageLayout from 'components/PageLayout';

import './pricing.sass';
import check from 'images/check.svg';
import tooltip from 'images/info-tooltip-dark.svg';
import { parse } from 'flatted/cjs';
import { camelize } from 'humps';

const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];

function prettyBytes(num) {
  if (isNaN(parseFloat(num)) || !isFinite(num)) {
    return '-';
  }

  if (num === 0) {
    return '0 bytes';
  }

  const number = Math.floor(Math.log(num) / Math.log(1024));

  return `${(num / 1024 ** Math.floor(number)).toFixed(0)} ${units[number]}`;
}

const numberWithCommas = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const b = bem.lock('PricingPage');

const Tooltip = ({ children, showIcon = true, hint }) => (
  <span className={bem('Tooltip', {})}>
    {children} { showIcon && <img alt="Info" src={tooltip} /> }
    {
      hint &&
        <span className="Tooltip__hint">{hint}</span>
    }
  </span>
);

const HintTooltip = ({ children, hints, apiId }) => (
  <Tooltip hint={hints[apiId].description}>
    {children}
  </Tooltip>
);

const formatValue = (name, value) => {
  if (name.endsWith('Bytes')) {
    return prettyBytes(value);
  }

  if (Number.isInteger(value)) {
    return numberWithCommas(value);
  }

  return value;
};

const ValueForLimit = ({ apiId, plan, datoPlan, hint }) => {
  if (datoPlan && datoPlan.attributes.hasOwnProperty(apiId)) {
    const value = datoPlan.attributes[apiId];


    if (value === null) {
      return <span>Unlimited</span>;
    }

    if (value === true) {
      return <img src={check} alt="Available feature" />;
    }

    return (
      <span>
        {formatValue(apiId, value)}
      </span>
    );
  }

  const value = hint.plans[plan.apiId];

  if (value === ':check:') {
    return <img src={check} alt="Available feature" />;
  }

  if (value === undefined) {
    return <span>Custom</span>;
  }

  return <span>{value}</span>;
};

class PricingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activePlan: '28', billing: 'yearly' };
  }

  handleChangePlan(activePlan) {
    this.setState({ activePlan });
  }

  handleBillingChange(billing, e) {
    e.preventDefault();
    this.setState({ billing });
  }

  renderPlanChanger() {
    const { activePlan } = this.state;
    const { data } = this.props;

    const plans = data.plans.edges.map(e => e.node);

    return (
      <div className={b('plan-changer')}>
        {plans
          .filter(plan => plan.name !== 'Developer')
          .map(plan => {
            return (
              <button
                key={`button-${plan.apiId}`}
                className={b('plan-changer__plan', {
                  active: activePlan === plan.apiId,
                })}
                onClick={this.handleChangePlan.bind(this, plan.apiId)}
              >
                {plan.name}
              </button>
            );
          })}
      </div>
    );
  }

  renderBillingChanger() {
    return (
      <div className={b('billing')}>
        <div className={b('billing-group')}>
          <button
            onClick={this.handleBillingChange.bind(this, 'monthly')}
            className={b('billing-group-item', {
              active: this.state.billing === 'monthly',
            })}
          >
            Monthly
          </button>
          <button
            onClick={this.handleBillingChange.bind(this, 'yearly')}
            className={b('billing-group-item', {
              active: this.state.billing === 'yearly',
            })}
          >
            Annual (20% off)
          </button>
        </div>
      </div>
    );
  }

  renderPlanRecap(hints, plan) {
    const { activePlan } = this.state;

    const datoPlans = parse(this.props.data.datoPlans.body);
    const datoPlan = datoPlans.find(p => p.id === plan.apiId);

    const isEnterprise = !datoPlan;
    const isFree = datoPlan && datoPlan.attributes.monthlyPrice === 0;
    const isBlackFriday = this.state.billing === 'yearly' && !!plan.promoTitle;

    if (isFree) {
      return null;
    }

    return (
      <div
        key={`recap-item-${plan.apiId}`}
        className={b('recap-item', {
          active: activePlan === plan.apiId,
          enterprise: isEnterprise,
          blackFriday: isBlackFriday,
          mostPopular: plan.mostPopular,
        })}
      >
        {isBlackFriday && (
          <div className={b('recap-item-ribbon')}>
            {plan.promoTitle}
            <span>{plan.promoDescription}</span>
          </div>
        )}
        <div className={b('recap-item-plan-name')}>{plan.name}</div>
        <div className={b('recap-item-for')}>{plan.description}</div>
        <div className={b('recap-item-price')}>
          {isFree && <div className={b('recap-item-price-free')}>Free</div>}
          {isEnterprise && (
            <div className={b('recap-item-price-free')}>
              <a href="mailto:support@datocms.com">Let's talk</a>
            </div>
          )}
          {!isFree &&
            !isEnterprise && [
              <div key="amount" className={b('recap-item-price-amount')}>
                {this.state.billing === 'monthly'
                  ? `€${datoPlan.attributes.monthlyPrice}`
                  : `€${parseInt(datoPlan.attributes.yearlyPrice / 12)}`}
              </div>,
              isBlackFriday && (
                <div className={b('recap-item-discount')}>
                  <span>€99</span> 50% off
                </div>
              ),
              <div key="period" className={b('recap-item-price-period')}>
                per project/month
              </div>,
            ]}
        </div>
        <div className={b('recap-item-unlimited')}>
          {isEnterprise
            ? 'Custom SLA contracts, plus'
            : 'Unlimited records and file storage, plus'}
        </div>
        {isEnterprise ? (
          <div className={b('recap-item-specs')}>
            <div className={b('recap-item-everything')}>
              <span>
                Everything unlimited, SLA contracts, team training, custom
                developments
              </span>
            </div>
          </div>
        ) : (
          <div className={b('recap-item-specs')}>
            <div className={b('recap-item-spec')}>
              <HintTooltip hints={hints} apiId="itemTypes">
                <ValueForLimit
                  apiId="itemTypes"
                  hint={hints.itemTypes}
                  plan={plan}
                  datoPlan={datoPlans.find(p => p.id === plan.apiId)}
                />{' '}
                models
              </HintTooltip>
            </div>
            <div className={b('recap-item-spec')}>
              <HintTooltip hints={hints} apiId="locales">
                <ValueForLimit
                  apiId="locales"
                  hint={hints.locales}
                  plan={plan}
                  datoPlan={datoPlans.find(p => p.id === plan.apiId)}
                />{' '}
                locales
              </HintTooltip>
            </div>
            <div className={b('recap-item-spec')}>
              <HintTooltip hints={hints} apiId="users">
                <ValueForLimit
                  apiId="users"
                  hint={hints.users}
                  plan={plan}
                  datoPlan={datoPlans.find(p => p.id === plan.apiId)}
                />{' '}
                users
              </HintTooltip>
            </div>
            <div className={b('recap-item-spec')}>
              <HintTooltip hints={hints} apiId="roles">
                <ValueForLimit
                  apiId="roles"
                  hint={hints.roles}
                  plan={plan}
                  datoPlan={datoPlans.find(p => p.id === plan.apiId)}
                />{' '}
                roles
              </HintTooltip>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderTablePriceRow(plan) {
    const { activePlan } = this.state;

    const datoPlans = parse(this.props.data.datoPlans.body);
    const datoPlan = datoPlans.find(p => p.id === plan.apiId);

    const isEnterprise = !datoPlan;
    const isFree = datoPlan && datoPlan.attributes.monthlyPrice === 0;

    return (
      <td
        key={`price-row-${plan.apiId}`}
        className={b('details-price-cell', {
          active: activePlan === plan.apiId,
        })}
      >
        <div className={b('details-price')}>
          <div className={b('details-price-inner')}>
            {isFree && <div className={b('details-price-free')}>Free</div>}

            {isEnterprise && (
              <div className={b('details-price-free')}>Let's talk</div>
            )}

            {!isFree &&
              !isEnterprise && [
                <div key="1" className={b('details-price-amount')}>
                  {this.state.billing === 'monthly'
                    ? `€${datoPlan.attributes.monthlyPrice}`
                    : `€${parseInt(datoPlan.attributes.yearlyPrice / 12)}`}
                </div>,
                <div key="2" className={b('details-price-period')}>
                  per project/month
                </div>,
                <div key="3" className={b('details-price-prorated')}>
                  Pro-rated daily
                </div>,
              ]}
          </div>
        </div>
      </td>
    );
  }

  render() {
    const { data } = this.props;
    const { activePlan } = this.state;

    const plans = data.plans.edges.map(e => e.node);
    const hints = data.hints.edges
      .map(e => e.node)
      .reduce((acc, hint) => {
        acc[camelize(hint.apiId)] = {
          name: hint.name,
          description: hint.description,
          plans: hint.plans.reduce((acc, plan) => {
            acc[plan.plan.apiId] = plan.value;
            return acc;
          }, {}),
        };
        return acc;
      }, {});

    const hintKeys = Object.keys(hints);

    const datoPlans = parse(this.props.data.datoPlans.body);

    return (
      <Layout>
        <HelmetDatoCms seo={data.page.seoMetaTags} />
        <PageLayout
          title="The right price for any digital product"
          subtitle="Unlimited records and file storage. Scale on complexity, not quantity."
        >
          <div className={b()}>
            {this.renderBillingChanger()}
            {this.renderPlanChanger()}
            <div className={b('recap')}>
              {plans.map(this.renderPlanRecap.bind(this, hints))}
            </div>

            <div className={b('free-plan')}>
              <div className={b('free-plan-title')}>
                Start with our forever free plan
              </div>
              <div>
                <div className={b('free-plan-description')}>
                  All the essential features included, 1,000 records, 15 models,
                  1GB file storage
                </div>
                <a
                  className={button({ red: true, 'normal-big': true })}
                  href="https://dashboard.datocms.com/signup"
                >
                  Try it for free
                </a>
                <div className={b('free-plan-credit-card')}>
                  No credit card required, 30 seconds sign-up
                </div>
              </div>
            </div>

            {this.renderPlanChanger()}

            <table className={b('details')}>
              <tbody>
                <tr className={b('details-header-row')}>
                  <td className={b('details-header-cell')} rowSpan="2">
                    <div className={b('details-header')}>
                      <div className={b('details-header-inner')}>
                        <div className={b('details-header-title')}>
                          Feature comparison
                        </div>
                        <div className={b('details-header-description')}>
                          Choose the best for you and get in touch for any help
                        </div>
                      </div>
                    </div>
                  </td>
                  {plans.map(plan => (
                    <td
                      key={`plan-${plan.apiId}`}
                      className={b('details-plan-name', {
                        active: activePlan === plan.apiId,
                      })}
                    >
                      {plan.name}
                    </td>
                  ))}
                </tr>
                <tr className={b('details-header-row')}>
                  {plans.map(this.renderTablePriceRow.bind(this))}
                </tr>
                {hintKeys
                .filter(k => !['items', 'uploadableBytes'].includes(k))
                .map((hintKey, index) => {

                  const extraPacket = plans
                    .map(plan => {
                      const datoPlan = datoPlans.find(p => p.id === plan.apiId);
                      return datoPlan && ((datoPlan.attributes.extraPackets && datoPlan.attributes.extraPackets[hintKey]) || (
                        datoPlan.attributes.autoPackets && datoPlan.attributes.autoPackets[hintKey]
                      ));
                    })
                    .filter(x => !!x)[0];

                  let limit = hintKey;

                  if (limit === 'itemTypes') {
                    limit = 'models';
                  }

                  if (limit === 'deploymentEnvironments') {
                    limit = 'environments';
                  }

                  if (limit === 'trafficBytes') {
                    limit = 'bandwidth';
                  }

                  if (limit === 'apiCalls') {
                    limit = 'calls';
                  }

                  return (
                    <tr key={`${hintKey}-${index}`}>
                      <td className={b('details-feature-name')}>
                        <div>
                          <HintTooltip hints={hints} apiId={hintKey}>
                            <span className={b('details-feature-name__name')}>{hints[hintKey].name}</span>
                          </HintTooltip>
                        </div>
                        {
                          extraPacket && (
                              <div className={b('details-feature-name__description')}>
                                {
                                  extraPacket.amountPerPacket === 1 ?
                                    `Extra ${limit} for €${extraPacket.price} each` :
                                    `€${extraPacket.price} every ${formatValue(hintKey, extraPacket.amountPerPacket)} extra ${limit}`
                                }
                              </div>
                            )
                        }
                      </td>
                      {plans.map(plan => (
                        <td
                          key={`hint-plan-${plan.apiId}`}
                          className={b('details-feature-value', {
                            active: activePlan === plan.apiId,
                          })}
                        >
                            <ValueForLimit
                              apiId={hintKey}
                              hint={hints[hintKey]}
                              plan={plan}
                              datoPlan={datoPlans.find(p => p.id === plan.apiId)}
                            />
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td className={b('details-feature-name')} />
                  {plans.map(plan =>
                    plan.code === 'enterprise' ? (
                      <td
                        key={`fixed-${plan.apiId}`}
                        className={b('details-cta', {
                          active: activePlan === plan.apiId,
                        })}
                      >
                        <a href="mailto:support@datocms.com">Get in touch</a>
                      </td>
                    ) : (
                      <td
                        key={`customizable-${plan.apiId}`}
                        className={b('details-cta', {
                          active: activePlan === plan.apiId,
                        })}
                      >
                        <a href="https://dashboard.datocms.com/signup">
                          Sign up
                        </a>
                      </td>
                    ),
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={b('faq')}>
            <div className={b('faq-title')}>Frequently Asked Questions</div>
            <div className={b('faq-questions')}>
              {data.faqs.edges
                .map(e => e.node)
                .map((faq, index) => (
                  <div className={b('faq-item')} key={index}>
                    <div className={b('faq-item-question')}>{faq.question}</div>
                    <div
                      className={b('faq-item-answer')}
                      dangerouslySetInnerHTML={{
                        __html: faq.answer.markdown.html,
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        </PageLayout>
      </Layout>
    );
  }
}

export default PricingPage;

export const query = graphql`
  query PricingPageQuery {
    page: datoCmsPricingPage {
      seoMetaTags {
        ...GatsbyDatoCmsSeoMetaTags
      }
    }

    faqs: allDatoCmsFaq(sort: { fields: [position] }) {
      edges {
        node {
          question
          answer: answerNode {
            markdown: childMarkdownRemark {
              html
            }
          }
        }
      }
    }

    plans: allDatoCmsNewPlan(sort: { fields: [position] }) {
      edges {
        node {
          apiId
          name
          description
          mostPopular
          promoTitle
          promoDescription
        }
      }
    }

    hints: allDatoCmsNewPricingHint(sort: { fields: [position] }) {
      edges {
        node {
          apiId
          name
          description
          plans {
            plan {
              apiId
            }
            value
          }
        }
      }
    }

    datoPlans: plans {
      body
    }
  }
`;
