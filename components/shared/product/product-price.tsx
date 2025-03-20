import { cn } from "@/lib/utils";

const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  // Ensure two decimal points are always shown
  const stringValue = value.toFixed(2);
  const [dollars, cents] = stringValue.split(".");
  return (
    <p className={cn("text-2xl font-bold", className)}>
      <span className="text-xs align-super">$</span>
      {dollars}
      <span className="text-xs align-super">.{cents}</span>
    </p>
  );
};

export default ProductPrice;
