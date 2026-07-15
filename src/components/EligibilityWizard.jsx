import React, { useState, useMemo, useEffect } from 'react';
import { translations } from '../data/localization';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Delhi', 'Puducherry', 'Ladakh'
];

export default function EligibilityWizard({ schemes, onSelectScheme, onResetWizard, lang = 'en' }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    state: '',
    residency: '',
    caste: '',
    disabled: '',
    minority: '',
    employment: '',
    income: '',
    bpl: '',
    govtEmployee: ''
  });

  const t = translations[lang] || translations.en;
  const totalSteps = 5;

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps + 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetForm = () => {
    setFormData({
      gender: '',
      age: '',
      state: '',
      residency: '',
      caste: '',
      disabled: '',
      minority: '',
      employment: '',
      income: '',
      bpl: '',
      govtEmployee: ''
    });
    setStep(1);
  };

  // Rule verification logic running dynamically
  const matchedSchemes = useMemo(() => {
    const userAge = parseInt(formData.age) || 0;
    const userIncome = parseInt(formData.income) || 0;

    return schemes.filter(scheme => {
      const r = scheme.rules;

      // 1. Age Rule
      if (formData.age !== '' && (userAge < r.minAge || userAge > r.maxAge)) return false;

      // 2. Gender Rule
      if (formData.gender !== '' && r.genders.indexOf('All') === -1 && r.genders.indexOf(formData.gender) === -1) return false;

      // 3. State Rule
      if (formData.state !== '' && r.states.indexOf('All') === -1 && r.states.indexOf(formData.state) === -1) return false;

      // 4. Residency Rule
      if (formData.residency !== '' && r.residency.indexOf('Both') === -1 && r.residency.indexOf(formData.residency) === -1) return false;

      // 5. Caste Rule
      if (formData.caste !== '' && r.castes.indexOf('All') === -1 && r.castes.indexOf(formData.caste) === -1) return false;

      // 6. Income Rule
      if (formData.income !== '' && userIncome > r.maxIncome) return false;

      // 7. Disability Rule
      if (formData.disabled !== '') {
        if (formData.disabled === 'Yes' && r.disability.indexOf('Yes') === -1 && r.disability.indexOf('Both') === -1) return false;
        if (formData.disabled === 'No' && r.disability.indexOf('No') === -1 && r.disability.indexOf('Both') === -1) return false;
      }

      // 8. Minority Rule
      if (formData.minority !== '') {
        if (formData.minority === 'Yes' && r.minority.indexOf('Yes') === -1 && r.minority.indexOf('Both') === -1) return false;
        if (formData.minority === 'No' && r.minority.indexOf('No') === -1 && r.minority.indexOf('Both') === -1) return false;
      }

      // 9. Employment Rule
      if (formData.employment !== '' && r.employment.indexOf('All') === -1 && r.employment.indexOf(formData.employment) === -1) return false;

      // 10. BPL Rule
      if (formData.bpl !== '') {
        if (formData.bpl === 'Yes' && r.bpl.indexOf('Yes') === -1 && r.bpl.indexOf('Both') === -1) return false;
        if (formData.bpl === 'No' && r.bpl.indexOf('No') === -1 && r.bpl.indexOf('Both') === -1) return false;
      }

      // 11. Government Employee Rule
      if (formData.govtEmployee !== '') {
        if (formData.govtEmployee === 'Yes' && r.govtEmployee.indexOf('Yes') === -1 && r.govtEmployee.indexOf('Both') === -1) return false;
        if (formData.govtEmployee === 'No' && r.govtEmployee.indexOf('No') === -1 && r.govtEmployee.indexOf('Both') === -1) return false;
      }

      return true;
    });
  }, [schemes, formData]);

  // Validate current step
  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.gender !== '' && formData.age !== '' && parseInt(formData.age) >= 0;
      case 2:
        return formData.state !== '' && formData.residency !== '';
      case 3:
        return formData.caste !== '' && formData.disabled !== '' && formData.minority !== '';
      case 4:
        return formData.employment !== '' && formData.income !== '' && parseInt(formData.income) >= 0;
      case 5:
        return formData.bpl !== '' && formData.govtEmployee !== '';
      default:
        return true;
    }
  };

  // Benefit Calculator Logic
  const totalPotentialBenefits = useMemo(() => {
    let total = 0;
    matchedSchemes.forEach(scheme => {
      // Basic text extraction algorithm: looks for ₹ or Rs. followed by numbers/commas
      if (scheme.benefits) {
        let maxFound = 0;
        scheme.benefits.forEach(benefit => {
          const match = benefit.match(/(?:₹|Rs\.?\s*)((?:\d+,?)+\d*)/i);
          if (match) {
            const amount = parseInt(match[1].replace(/,/g, ''), 10);
            if (amount && amount > maxFound && amount < 10000000) {
              maxFound = amount; // take largest amount per scheme
            }
          }
        });
        total += maxFound;
      }
    });
    return total;
  }, [matchedSchemes]);

  // Success event placeholder
  useEffect(() => {
    if (step > totalSteps && matchedSchemes.length > 0) {
      // Professional success analytics or logging could go here
    }
  }, [step]);

  const handleWhatsAppShare = () => {
    const schemeNames = matchedSchemes.slice(0, 5).map(s => `• ${s.title}`).join('%0A');
    const benefitText = totalPotentialBenefits > 0
      ? `%0A%0A Total potential benefits: ${totalPotentialBenefits.toLocaleString('en-IN')}`
      : '';
    const message = `I just found ${matchedSchemes.length} government schemes I am eligible for via the SchemeSense Portal!${benefitText}%0A%0ATop schemes:%0A${schemeNames}%0A%0ACheck yours: https://schemesense-ai.netlify.app`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="container wizard-outer-layout view-enter">
      
      <div className="wizard-split-grid">
        
        {/* Left Side: Wizard Form Panel */}
        <div className="wizard-card ">
          
          {/* Progress Tracker */}
          {step <= totalSteps && (
            <div className="wizard-progress-bar-container">
              <div className="wizard-progress-text">
                <span className="step-count-label">Step {step} of {totalSteps}</span>
                <span className="step-title-label">
                  {step === 1 && t.stepBasic}
                  {step === 2 && t.stepLocation}
                  {step === 3 && t.stepSocio}
                  {step === 4 && t.stepIncome}
                  {step === 5 && t.stepWelfare}
                </span>
              </div>
              <div className="progress-track-bg">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Steps Contents */}
          <div className="wizard-step-content-box">
            
            {/* Step 1: Basic Profile */}
            {step === 1 && (
              <div className="step-fade-in">
                <h2>Let's build your profile</h2>
                <p className="step-subheading">Providing basic demographics ensures accurate age-restricted welfare mappings.</p>
                
                <div className="form-group">
                  <label className="form-label">{t.genderLabel}</label>
                  <div className="wizard-choices-row">
                    {[
                      { id: 'Male', label: t.genderMale, icon: '👨' },
                      { id: 'Female', label: t.genderFemale, icon: '👩' },
                      { id: 'Transgender', label: t.genderTrans, icon: '🧑' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`choice-card-button ${formData.gender === item.id ? 'active' : ''}`}
                        onClick={() => handleSelect('gender', item.id)}
                      >
                        <span className="choice-card-icon">{item.icon}</span>
                        <span className="choice-card-text">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="w-age">{t.ageLabel}</label>
                  <input
                    type="number"
                    id="w-age"
                    placeholder="Enter age (e.g. 24)"
                    className="form-input-large"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location & Residency */}
            {step === 2 && (
              <div className="step-fade-in">
                <h2>Where do you live?</h2>
                <p className="step-subheading">Many welfare programs are funded specifically by states or targeted for rural developments.</p>

                <div className="form-group">
                  <label className="form-label" htmlFor="w-state">{t.stateLabel}</label>
                  <select
                    id="w-state"
                    className="form-select-large"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                  >
                    <option value="" disabled>-- Select State --</option>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{(t.states && t.states[st]) ? t.states[st] : st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.residencyLabel}</label>
                  <div className="wizard-choices-row">
                    {[
                      { id: 'Rural', label: t.resRural, icon: '🏡' },
                      { id: 'Urban', label: t.resUrban, icon: '🏢' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`choice-card-button ${formData.residency === item.id ? 'active' : ''}`}
                        onClick={() => handleSelect('residency', item.id)}
                      >
                        <span className="choice-card-icon">{item.icon}</span>
                        <span className="choice-card-text">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Socio-demographics */}
            {step === 3 && (
              <div className="step-fade-in">
                <h2>Socio-Demographics Profile</h2>
                <p className="step-subheading">Government systems utilize socio-demographic indicators to direct aids to marginalized categories.</p>

                <div className="form-group">
                  <label className="form-label">Caste Category</label>
                  <div className="wizard-choices-row">
                    {[
                      { id: 'General', label: t.casteGen },
                      { id: 'OBC', label: t.casteOBC },
                      { id: 'SC', label: t.casteSC },
                      { id: 'ST', label: t.casteST }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`choice-card-button ${formData.caste === item.id ? 'active' : ''}`}
                        onClick={() => handleSelect('caste', item.id)}
                      >
                        <span className="choice-card-text">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Are you Differently Abled (PwD)?</label>
                  <div className="wizard-choices-row">
                    {['Yes', 'No'].map(choice => (
                      <button
                        key={choice}
                        type="button"
                        className={`choice-card-button ${formData.disabled === choice ? 'active' : ''}`}
                        onClick={() => handleSelect('disabled', choice)}
                      >
                        <span className="choice-card-text">{choice}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Do you belong to a Minority community?</label>
                  <div className="wizard-choices-row">
                    {['Yes', 'No'].map(choice => (
                      <button
                        key={choice}
                        type="button"
                        className={`choice-card-button ${formData.minority === choice ? 'active' : ''}`}
                        onClick={() => handleSelect('minority', choice)}
                      >
                        <span className="choice-card-text">{choice}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Income & Employment */}
            {step === 4 && (
              <div className="step-fade-in">
                <h2>Income & Occupational Status</h2>
                <p className="step-subheading">Benefits checks evaluate occupational segments and set annual family income ceilings.</p>

                <div className="form-group">
                  <label className="form-label">Primary Employment Category</label>
                  <select
                    className="form-select-large"
                    value={formData.employment}
                    onChange={(e) => handleChange('employment', e.target.value)}
                  >
                    <option value="" disabled>-- Select Employment --</option>
                    <option value="Student">Student</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Self-Employed">Self-Employed / Entrepreneur</option>
                    <option value="Worker">Worker / Labourer</option>
                    <option value="Retired">Retired Senior Citizen</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="All">Other / General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="w-income">Annual Family Income (₹)</label>
                  <input
                    type="number"
                    id="w-income"
                    placeholder="Enter income in ₹ (e.g. 150000)"
                    className="form-input-large"
                    min="0"
                    value={formData.income}
                    onChange={(e) => handleChange('income', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Welfare Details */}
            {step === 5 && (
              <div className="step-fade-in">
                <h2>Welfare Card Status</h2>
                <p className="step-subheading">Possession of state-issued ration cards or employment tags verifies final eligibility.</p>

                <div className="form-group">
                  <label className="form-label">Do you possess a BPL (Below Poverty Line) card?</label>
                  <div className="wizard-choices-row">
                    {['Yes', 'No'].map(choice => (
                      <button
                        key={choice}
                        type="button"
                        className={`choice-card-button ${formData.bpl === choice ? 'active' : ''}`}
                        onClick={() => handleSelect('bpl', choice)}
                      >
                        <span className="choice-card-text">{choice}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Are you or your parent a Government Employee?</label>
                  <div className="wizard-choices-row">
                    {['Yes', 'No'].map(choice => (
                      <button
                        key={choice}
                        type="button"
                        className={`choice-card-button ${formData.govtEmployee === choice ? 'active' : ''}`}
                        onClick={() => handleSelect('govtEmployee', choice)}
                      >
                        <span className="choice-card-text">{choice}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Final Results (If step > totalSteps) */}
            {step > totalSteps && (
              <div className="step-fade-in results-summary-box">
                <h2>{t.wizardEligibleTitle}</h2>
                <p>{t.wizardEligibleDesc}</p>

                {matchedSchemes.length > 0 && (
                  <div className="benefits-calculator-card animate-scale-in">
                    <div className="calculator-icon">💰</div>
                    <div className="calculator-info">
                      <h4>Total Potential Benefits</h4>
                      <div className="calculator-amount">
                        {totalPotentialBenefits > 0 ? `₹${totalPotentialBenefits.toLocaleString('en-IN')}` : 'Variable Amount'}
                      </div>
                      <p>Based on your profile, you could be eligible for this much financial assistance.</p>
                    </div>
                  </div>
                )}

                {matchedSchemes.length > 0 ? (
                  <div className="final-matches-listing">
                    {matchedSchemes.map(sch => (
                      <div 
                        key={sch.id} 
                        className="final-match-card-item"
                        onClick={() => onSelectScheme(sch)}
                      >
                        <div className="match-card-meta">
                          <span className="badge badge-primary">{sch.category}</span>
                          <span className="badge badge-secondary">{sch.type}</span>
                        </div>
                        <h3>{sch.title}</h3>
                        <p>{sch.description}</p>
                        <span className="click-view-label">Check Requirements & Apply Online →</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-results-box">
                    <p>{t.wizardNoMatches}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button className="btn btn-primary" onClick={handleWhatsAppShare} style={{ flex: 1, backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Share
                  </button>
                  <button className="btn btn-secondary" onClick={resetForm} style={{ flex: 1 }}>
                    {t.resetWizard}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Action Row buttons */}
          {step <= totalSteps && (
            <div className="wizard-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary btn-large"
                onClick={prevStep}
                disabled={step === 1}
              >
                ← {t.back}
              </button>
              
              {step < totalSteps ? (
                <button 
                  type="button" 
                  className="btn btn-primary btn-large"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                >
                  {t.next} →
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary btn-large"
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepValid()}
                >
                  {t.submit} ✓
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Live Qualifying Schemes Sidebar */}
        <div className="wizard-live-sidebar ">
          <div className="sidebar-header">
            <h3>Matching Live Checklist</h3>
            <span className="live-counter-bubble">{matchedSchemes.length}</span>
          </div>
          <p className="sidebar-intro">Welfare matches recalculating instantly based on active inputs.</p>
          
          <div className="sidebar-schemes-list">
            {matchedSchemes.length > 0 ? (
              matchedSchemes.map(sch => (
                <div 
                  key={sch.id} 
                  className="sidebar-scheme-item"
                  onClick={() => onSelectScheme(sch)}
                >
                  <div className="sidebar-sch-tag">{sch.type} Scheme</div>
                  <h4>{sch.title}</h4>
                  <p>{sch.ministry}</p>
                </div>
              ))
            ) : (
              <div className="sidebar-empty">
                <p>No matching schemes match the currently input parameters.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .wizard-outer-layout {
          padding: 3rem 1rem;
        }

        .benefits-calculator-card {
          background: var(--primary) 0%, #ff8c42 100%);
          border-radius: var(--radius-lg);
          padding: 1.5rem 2rem;
          margin: 2rem 0;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          color: white;
          box-shadow: 0 10px 25px -5px rgba(249, 115, 22, 0.4);
        }

        .calculator-icon {
          font-size: 3rem;
          background: rgba(255,255,255,0.2);
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .calculator-info h4 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          opacity: 0.9;
        }

        .calculator-amount {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .calculator-info p {
          font-size: 0.9rem;
          opacity: 0.85;
          margin: 0;
        }

        @media (max-width: 600px) {
          .benefits-calculator-card {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
          .calculator-amount {
            font-size: 2rem;
          }
        }

        .wizard-split-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 2.5rem;
        }

        @media (max-width: 900px) {
          .wizard-split-grid {
            grid-template-columns: 1fr;
          }
        }

        .wizard-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .wizard-progress-bar-container {
          margin-bottom: 2rem;
        }

        .wizard-progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .step-count-label {
          color: var(--primary);
        }

        .step-title-label {
          color: var(--text-primary);
        }

        .progress-track-bg {
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.35s ease-in-out;
        }

        .wizard-step-content-box {
          flex-grow: 1;
          margin-bottom: 2rem;
        }

        .step-fade-in h2 {
          font-size: 1.65rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .step-subheading {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .form-input-large, .form-select-large {
          background: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .form-input-large:focus, .form-select-large:focus {
          border-color: var(--primary);
        }

        .wizard-choices-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 0.75rem;
          width: 100%;
        }

        .choice-card-button {
          background: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--text-primary);
          font-weight: 500;
        }

        .choice-card-button:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .choice-card-button.active {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .choice-card-icon {
          font-size: 1.5rem;
        }

        .choice-card-text {
          font-size: 0.82rem;
          font-weight: 700;
        }

        .wizard-actions-row {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }

        .btn-large {
          padding: 0.75rem 2rem;
          font-weight: 700;
          font-size: 0.95rem;
        }

        /* Results matching block */
        .final-matches-listing {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1.5rem;
          max-height: 450px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .final-match-card-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .final-match-card-item:hover {
          border-color: var(--primary);
          background: var(--bg-secondary);
          box-shadow: var(--shadow-md);
        }

        .match-card-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .final-match-card-item h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .final-match-card-item p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .click-view-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
        }

        .empty-results-box {
          padding: 3rem 1rem;
          text-align: center;
          background: var(--bg-tertiary);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        /* Live Sidebar */
        .wizard-live-sidebar {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
          height: fit-content;
          text-align: left;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .sidebar-header h3 {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .live-counter-bubble {
          background: var(--primary);
          color: white;
          font-size: 0.8rem;
          font-weight: 800;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-intro {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-weight: 600;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .sidebar-schemes-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .sidebar-scheme-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sidebar-scheme-item:hover {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .sidebar-sch-tag {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.25rem;
          text-transform: uppercase;
        }

        .sidebar-scheme-item h4 {
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 0.15rem;
          color: var(--text-primary);
        }

        .sidebar-scheme-item p {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sidebar-empty {
          color: var(--text-muted);
          font-size: 0.82rem;
          text-align: center;
          padding: 2rem 0;
        }
      `}</style>

    </div>
  );
}
