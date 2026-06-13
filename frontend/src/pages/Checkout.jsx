import React, { useState } from 'react';

export default function Checkout({ cartItems, setVista }) {
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.precio), 0);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-7">
          <h3 className="fw-bold mb-4">Finalizar Pedido</h3>
          
          {/* Card: Envío */}
          <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
            <h5 className="fw-bold mb-3 text-primary">Información de Envío</h5>
            <input className="form-control mb-3" placeholder="Dirección completa" />
            <div className="bg-light p-3 rounded text-center text-muted">
               [Mapa Interactivo - Simulación]
            </div>
          </div>

          {/* Card: Pagos */}
          <div className="card border-0 shadow-sm p-4 rounded-4">
            <h5 className="fw-bold mb-3 text-primary">Método de Pago</h5>
            <div className="d-flex gap-4 mb-4">
                <label className={`p-3 border rounded-3 cursor-pointer ${paymentMethod === 'tarjeta' ? 'border-primary' : ''}`} onClick={() => setPaymentMethod('tarjeta')}>
                    <i className="bi bi-credit-card fs-3"></i><br/>Tarjeta
                </label>
                <label className={`p-3 border rounded-3 cursor-pointer ${paymentMethod === 'yape' ? 'border-primary' : ''}`} onClick={() => setPaymentMethod('yape')}>
                    <i className="bi bi-phone fs-3"></i><br/>Yape/Plin
                </label>
            </div>
            
            {paymentMethod === 'tarjeta' ? (
                <div className="row g-2">
                    <input className="form-control" placeholder="Nombre en la tarjeta" />
                    <input className="form-control" placeholder="Número de tarjeta" />
                </div>
            ) : (
                <div className="alert alert-light text-center">Escanea el QR para completar el pago.</div>
            )}
          </div>
        </div>

        {/* Resumen Final */}
        <div className="col-lg-5">
            <div className="card border-0 shadow-lg p-4 rounded-4 bg-primary text-white">
                <h4 className="fw-bold">Resumen</h4>
                <div className="d-flex justify-content-between mt-3"><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
                <div className="d-flex justify-content-between"><span>Envío</span><span>S/ 10.00</span></div>
                <hr />
                <h2 className="fw-bold">Total: S/ {(subtotal + 10).toFixed(2)}</h2>
                <button className="btn btn-warning mt-3 w-100 rounded-pill fw-bold">Confirmar Compra</button>
            </div>
        </div>
      </div>
    </div>
  );
}