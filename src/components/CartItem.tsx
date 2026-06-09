import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  item: {
    id: string;
    title: string;
    artist: string;
    price: number;
    image: string;
    quantity: number;
  };
}


const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-stone-200">
      <div className="flex flex-col sm:flex-row gap-6">
        <img
          src={item.image}
          alt={item.title}
          className="w-full sm:w-32 h-32 object-cover rounded-lg"
        />
        
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-stone-800">{item.title}</h3>
            <p className="text-stone-600">by {item.artist}</p>
            <p className="text-2xl font-bold text-stone-800 mt-2">${item.price}</p>
          </div>
          
          <div className="flex items-center justify-between">
         
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFromCart(item.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;