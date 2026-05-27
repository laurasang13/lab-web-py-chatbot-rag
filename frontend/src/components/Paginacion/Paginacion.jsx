import React from 'react';
import styles from "../Paginacion/Paginacion.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className={styles["pagination-container"]}>
      
      <button 
        className={styles["page-btn"]}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
        disabled={currentPage === 1}
      >
        &laquo; Anterior
      </button>

      <span className={styles["page-info"]}>
        Página <strong>{currentPage}</strong> de {totalPages}
      </span>

      <button 
        className={styles["page-btn"]}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
        disabled={currentPage === totalPages}
      >
        Siguiente &raquo;
      </button>

    </div>
  );
};

export default Pagination;