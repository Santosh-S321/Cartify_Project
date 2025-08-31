import { useCart } from "../context/CartContext";
import { products } from "../data/products";

function Shop() {
  const { addToCart } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page content */}
      <main className="flex-grow max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Products</h1>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (

            <li key={p.id} className="border p-4 rounded-lg shadow-sm flex flex-col items-center space-y-2" >

                <img src={p.image} alt={p.name} className="w-32 h-32 object-cover mx-auto"/>
                <span className="block font-semibold text-lg text-center mt-2">{p.name}</span>
              
              
              <span className="block text-gray-700 text-center">₹{p.price}</span>
              
              <button onClick={() => addToCart(p)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Add to Cart
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default Shop;
