import React from 'react';
import styles from './PurchaseTable.module.css';

interface Purchase {
  id: number;
  buyerId: number;
  buyerName: string;
  carId: number;
  carName: string;
  dealershipName: string;
  finalPrice: number;
  purchaseDate: string;
}

interface PurchaseTableProps {
  purchases: Purchase[];
}

const PurchaseTable: React.FC<PurchaseTableProps> = ({ purchases }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Car</th>
            <th>Buyer</th>
            <th>Dealership</th>
            <th>Price</th>
            <th>Purchase Date</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id}>
              <td>
                <strong>{purchase.carName}</strong>
              </td>
              <td>{purchase.buyerName}</td>
              <td>{purchase.dealershipName}</td>
              <td>
                <span className={styles.price}>
                  {formatPrice(purchase.finalPrice)}
                </span>
              </td>
              <td>{formatDate(purchase.purchaseDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseTable;