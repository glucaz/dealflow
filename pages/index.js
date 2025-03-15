import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SalesTracker() {
  // Set initial month and year to current month and year
  const currentDate = new Date();
  const initialMonth = currentDate.toLocaleString('default', { month: 'long' });
  const initialYear = currentDate.getFullYear();

  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [deals, setDeals] = useState([]);
  const [viewDeals, setViewDeals] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [newDeal, setNewDeal] = useState({ name: "", date: "", products: [] });

  const [animateSliders, setAnimateSliders] = useState(false); // State to trigger slider animations
  const [showOverlay, setShowOverlay] = useState(true); // State to control the white overlay

  // Save deals to local storage whenever deals state is updated
  useEffect(() => {
    localStorage.setItem('deals', JSON.stringify(deals));
  }, [deals]);

  // Retrieve deals from local storage when the component mounts
  useEffect(() => {
    const storedDeals = localStorage.getItem('deals');
    if (storedDeals) {
      setDeals(JSON.parse(storedDeals));
    }
    // Add a slight delay before triggering the slider animations to prevent flashing
    setTimeout(() => {
      setAnimateSliders(true);
      setShowOverlay(false); // Hide the white overlay after a delay
    }, 500);
  }, []);

  const addDeal = () => setCurrentStep("name");

  const handleNameSubmit = () => setCurrentStep("date");

  const handleDateSubmit = () => setCurrentStep("products");

  const handleProductToggle = (product) => {
    setNewDeal((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
  };

  const calculateCommission = (deal) => {
    let baseCommission = deals.length < 16 ? 30 : 50;
    if (deals.length >= 18) baseCommission += 50;

    const productCommission = deal.products.reduce(
      (sum, p) => sum + (p === "Finance" ? 25 : 20),
      0
    );

    return baseCommission + productCommission;
  };

  const finalizeDeal = () => {
    setDeals([...deals, { ...newDeal, commission: calculateCommission(newDeal) }]);
    setCurrentStep(null);
    setAnimateSliders(false); // Reset slider animations
    setShowOverlay(true); // Show the white overlay before refreshing
    setTimeout(() => {
      setAnimateSliders(true);
      setShowOverlay(false); // Hide the white overlay after a delay
    }, 150); // Adjust the duration as needed
  };

  const calculateAfterTaxIncome = (filteredDeals) => {
    const grossIncome = 1950 + filteredDeals.reduce((sum, deal) => sum + deal.commission, 0);
    let yearlyIncome = grossIncome * 12;

    let tax = 0,
      ni = 0;

    if (yearlyIncome > 12570) {
      tax += Math.min(yearlyIncome - 12570, 37700) * 0.2;
      if (yearlyIncome > 50270) tax += (yearlyIncome - 50270) * 0.4;
    }

    if (yearlyIncome > 12570) {
      ni += Math.min(yearlyIncome - 12570, 50270) * 0.08;
      if (yearlyIncome > 50270) ni += (yearlyIncome - 50270) * 0.02;
    }

    return (yearlyIncome - tax - ni) / 12;
  };

  const filteredDeals = deals.filter(deal => {
    const dealDate = new Date(deal.date);
    const selectedMonth = new Date(`${month} 1, ${year}`);
    return (
      dealDate.getMonth() === selectedMonth.getMonth() &&
      dealDate.getFullYear() === selectedMonth.getFullYear()
    );
  });

  return (
    <div className="p-4 max-w-md mx-auto font-sans text-gray-800 relative">
      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          transition: opacity 0.5s ease-in-out;
          z-index: 10;
        }
        .overlay.hidden {
          opacity: 0;
          pointer-events: none;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .button-hover:hover {
          background-color: #ff6666;
          transition: background-color 0.2s ease-in-out;
        }
        .slide-in {
          animation: slideIn 0.3s ease-in-out forwards;
        }
        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .fill-up {
          animation: fillUp 1s ease-in-out forwards;
        }
        @keyframes fillUp {
          from { width: 0; }
          to { width: var(--width); }
        }
        .rounded-input {
          border-radius: 20px;
        }
        .modern-button {
          background-color: #ff6666;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          transition: background-color 0.3s ease-in-out;
        }
        .modern-button:hover {
          background-color: #cc5555;
        }
        .card-modern {
          border-radius: 20px;
          background-color: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .card-content-modern {
          padding: 20px;
        }
      `}</style>

      {/* White Overlay */}
      <div className={`overlay ${showOverlay ? '' : 'hidden'}`} />

      {/* Month Selector */}
      <div className="flex justify-between items-center mb-4 fade-in">
        <Button className="modern-button" onClick={() => setYear(year - 1)}>{"<"}</Button>
        <h2 className="text-xl font-bold">{year}</h2>
        <Button className="modern-button" onClick={() => setYear(year + 1)}>{">"}</Button>
      </div>

      <select
        className="w-full p-3 border rounded-input text-lg font-light bg-white focus:outline-none fade-in"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      >
        {[
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* Commission Box */}
      <Card className="mt-4 fade-in card-modern">
        <CardContent className="text-center card-content-modern">
          <p className="text-sm font-medium">Commission Earned</p>
          <p className="text-2xl font-bold">£{filteredDeals.reduce((sum, deal) => sum + deal.commission, 0)}</p>
        </CardContent>
      </Card>

      {/* After Tax Income */}
      <Card className="mt-2 fade-in card-modern">
        <CardContent className="text-center card-content-modern">
          <p className="text-sm font-medium">After Tax Income</p>
          <p className="text-2xl font-bold">£{calculateAfterTaxIncome(filteredDeals).toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Deal Count */}
      <div className="text-center mt-2 text-lg font-medium fade-in">
        Deals This Month: {filteredDeals.length}
      </div>

      {/* Sliders */}
      <div className="mt-4 fade-in">
        {["GARD X", "Cosmetic", "Finance"].map((product, index) => {
          const percentage = (filteredDeals.filter((deal) => deal.products.includes(product)).length / filteredDeals.length) * 100 || 0;
          return (
            <div key={index} className="mb-2">
              <p className="text-sm font-medium">{product}: {percentage.toFixed(1)}%</p>
                           <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
                <div className={`h-full bg-red-500 ${animateSliders ? 'fill-up' : ''}`} style={{ "--width": `${Math.min(percentage, 100)}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Button */}
      <Button className="w-full mt-4 modern-button" onClick={addDeal}>
        New Deal
      </Button>

      {/* View Deals Button */}
      <Button className="w-full mt-4 modern-button" onClick={() => setViewDeals(!viewDeals)}>
        {viewDeals ? "Hide Deals" : "View All Deals"}
      </Button>

      {viewDeals && (
        <div className="mt-4 border rounded p-2 bg-white shadow slide-in">
          {filteredDeals.length === 0 ? (
            <p className="text-center text-gray-500">No deals yet</p>
          ) : (
            filteredDeals.map((deal, index) => (
              <div key={index} className="p-2 border-b flex justify-between">
                <div>
                  <p className="text-sm font-medium">{deal.name}</p>
                  <p className="text-xs">{deal.products.join(", ") || "No Products"}</p>
                  <p className="text-xs">{new Date(deal.date).toLocaleDateString()}</p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-500"
                  onClick={() => setDeals(deals.filter((_, i) => i !== index))}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* New Deal Steps */}
           {currentStep && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center slide-in">
          <Button variant="outline" className="absolute top-4 left-4" onClick={() => setCurrentStep(null)}>
            Back
          </Button>
          {currentStep === "name" && (
            <>
              <p className="text-lg font-medium">What is the customer's name?</p>
              <input
                className="border p-2 w-64 mt-2 rounded-input"
                value={newDeal.name}
                onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
              />
              <Button className="mt-4 modern-button" onClick={handleNameSubmit}>
                Confirm
              </Button>
            </>
          )}
          {currentStep === "date" && (
            <>
              <p className="text-lg font-medium">When did they deal?</p>
              <input
                type="date"
                className="border p-2 w-64 mt-2 rounded-input"
                value={newDeal.date}
                onChange={(e) => setNewDeal({ ...newDeal, date: e.target.value })}
              />
              <Button className="mt-2 modern-button" onClick={() => setNewDeal({ ...newDeal, date: new Date().toISOString().split('T')[0] })}>
                Today
              </Button>
              <Button className="mt-4 modern-button" onClick={handleDateSubmit}>
                Submit
              </Button>
            </>
          )}
          {currentStep === "products" && (
            <>
              <p className="text-lg font-medium">What products?</p>
              {["GARD X", "Cosmetic", "Finance"].map((product) => (
                <label key={product} className="block mt-2">
                  <input type="checkbox" checked={newDeal.products.includes(product)} onChange={() => handleProductToggle(product)} /> {product}
                </label>
              ))}
              <Button className="mt-4 modern-button" onClick={finalizeDeal}>
                Done
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
