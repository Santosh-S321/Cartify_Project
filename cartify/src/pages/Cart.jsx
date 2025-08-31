import { useCart } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart } = useCart();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="mt-2">Cart is empty.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {cart.map((item) => (
            <li
              key={item.id}
              className="border p-2 rounded flex justify-between"
            >
              <span>
              <div className="w-36 h-36 mb-4">
              <img src={item.image} alt={item.name} className="shop-product-img rounded" />
              </div>
              {item.name} - ₹{item.price}
              </span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cart;