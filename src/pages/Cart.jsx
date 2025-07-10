import React from 'react'
import CartComponent from '../components/cart/CartComponent'
import CartNavigate from '../components/cart/CartNavigate'

const Cart = () => {
  return (
    <div>
      <CartNavigate/>
      <CartComponent/>
    </div>
  )
}

export default Cart