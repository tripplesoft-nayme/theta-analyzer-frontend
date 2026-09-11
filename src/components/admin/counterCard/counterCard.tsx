interface CounterCardProps {
  image: string;
  title: string;
  count: string;
}

const CounterCard = ({ image, title, count }: CounterCardProps) => {
  return (
    <div className="border border-gray-200 rounded-xl p-5 w-full">
      <div className="flex items-center gap-3">
        <img src={`/${image}`} alt="Icon" className="w-8 h-8" />
        <p className="font-semibold">{title}</p>
      </div>
      <h2 className="text-4xl mt-4">{count}</h2>
    </div>
  );
};

export default CounterCard;
