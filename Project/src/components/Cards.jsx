import './Cards.css';

const Cards = ({ title, value, bgColor, icon: Icon }) => {
return (
<div className="card" style={{ backgroundColor: bgColor }}>
      <div className="card-info">
        <p className="card-title">{title}</p>
        <p className="card-value">{value}</p>
      </div>
      <div className="card-icon-container">
        <Icon size={25} color="#FFFFFF" />
      </div>
    </div>
  );
};

export default Cards;