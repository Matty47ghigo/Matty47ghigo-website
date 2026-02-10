import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Lock, Check } from 'lucide-react';
import './CreditCard.css';

const CreditCardForm = ({ onSave, savedCard }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardMonth, setCardMonth] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSaved, setIsSaved] = useState(!!savedCard);

  const cardRef = useRef(null);

  useEffect(() => {
    if (savedCard) {
      setCardNumber(savedCard.cardNumber || '');
      setCardName(savedCard.cardName || '');
      setCardMonth(savedCard.cardMonth || '');
      setCardYear(savedCard.cardYear || '');
      setIsSaved(true);
    }
  }, [savedCard]);

  const getCardType = () => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^(34|37)/.test(number)) return 'amex';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^6011/.test(number)) return 'discover';
    if (/^9792/.test(number)) return 'troy';
    return 'visa';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatCvv = (value) => {
    return value.replace(/\D/g, '').substring(0, 4);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber && cardName && cardMonth && cardYear && cardCvv) {
      onSave({
        cardNumber: formatCardNumber(cardNumber),
        cardName,
        cardMonth,
        cardYear,
        cardCvv: formatCvv(cardCvv),
        cardType: getCardType()
      });
      setIsSaved(true);
    }
  };

  const handleFocus = (field) => {
    setFocusedField(field);
    if (field === 'cvv') {
      setIsFlipped(true);
    }
  };

  const handleBlur = () => {
    setFocusedField(null);
    setIsFlipped(false);
  };

  const cardType = getCardType();

  return (
    <div className="credit-card-container">
      <div className="credit-card-header">
        <CreditCard size={24} />
        <h3>Payment Method</h3>
      </div>

      {/* Card Preview */}
      <div className={`card-item ${isFlipped ? '-active' : ''}`}>
        <div className="card-item__side -front">
          <div 
            className={`card-item__focus ${focusedField ? '-active' : ''}`}
            ref={cardRef}
          />
          <div className="card-item__cover">
            <img 
              src={`/assets/images/${Math.floor(Math.random() * 25) + 1}.jpeg`} 
              className="card-item__bg" 
              alt="card background"
            />
          </div>
          <div className="card-item__wrapper">
            <div className="card-item__top">
              <img src="/assets/images/chip.png" className="card-item__chip" alt="chip" />
              <div className="card-item__type">
                <img 
                  src={`/assets/images/${cardType}.png`} 
                  alt={cardType} 
                  className="card-item__typeImg"
                />
              </div>
            </div>
            <div className="card-item__number">
              {formatCardNumber(cardNumber) || '#### #### #### ####'}
            </div>
            <div className="card-item__content">
              <div className="card-item__info">
                <div className="card-item__holder">Card Holder</div>
                <div className="card-item__name">
                  {cardName || 'FULL NAME'}
                </div>
              </div>
              <div className="card-item__date">
                <div className="card-item__dateTitle">Expires</div>
                <div className="card-item__dateItem">
                  {cardMonth || 'MM'}/{cardYear ? String(cardYear).slice(-2) : 'YY'}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-item__side -back">
          <div className="card-item__cover">
            <img 
              src={`/assets/images/${Math.floor(Math.random() * 25) + 1}.jpeg`} 
              className="card-item__bg" 
              alt="card background"
            />
          </div>
          <div className="card-item__band"></div>
          <div className="card-item__cvv">
            <div className="card-item__cvvTitle">CVV</div>
            <div className="card-item__cvvBand">
              {cardCvv ? cardCvv.split('').map(() => '*').join('') : '••••'}
            </div>
            <div className="card-item__type">
              <img 
                src={`/assets/images/${cardType}.png`} 
                alt={cardType} 
                className="card-item__typeImg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Form */}
      <form onSubmit={handleSubmit} className="card-form">
        <div className="card-input">
          <label className="card-input__label">Card Number</label>
          <input
            type="text"
            className="card-input__input"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
            onFocus={() => handleFocus('number')}
            onBlur={handleBlur}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>
        <div className="card-input">
          <label className="card-input__label">Card Holders</label>
          <input
            type="text"
            className="card-input__input"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            onFocus={() => handleFocus('name')}
            onBlur={handleBlur}
            placeholder="JOHN DOE"
          />
        </div>
        <div className="card-form__row">
          <div className="card-form__col">
            <div className="card-form__group">
              <label className="card-input__label">Expiration Date</label>
              <div className="date-selects">
                <select
                  className="card-input__input -select"
                  value={cardMonth}
                  onChange={(e) => setCardMonth(e.target.value)}
                  onFocus={() => handleFocus('date')}
                  onBlur={handleBlur}
                >
                  <option value="">Month</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  className="card-input__input -select"
                  value={cardYear}
                  onChange={(e) => setCardYear(e.target.value)}
                  onFocus={() => handleFocus('date')}
                  onBlur={handleBlur}
                >
                  <option value="">Year</option>
                  {[...Array(10)].map((_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className="card-form__col -cvv">
            <div className="card-input">
              <label className="card-input__label">CVV</label>
              <input
                type="password"
                className="card-input__input"
                value={cardCvv}
                onChange={(e) => setCardCvv(formatCvv(e.target.value))}
                onFocus={() => handleFocus('cvv')}
                onBlur={handleBlur}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>

        {isSaved && (
          <div className="saved-badge">
            <Check size={16} />
            <span>Card saved successfully</span>
          </div>
        )}

        <button type="submit" className="card-form__button">
          {isSaved ? 'Update Card' : 'Save Card'}
        </button>
      </form>

      <div className="security-note">
        <Lock size={14} />
        <span>Your payment information is encrypted and secure</span>
      </div>
    </div>
  );
};

export default CreditCardForm;
