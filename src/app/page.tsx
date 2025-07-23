'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube?: string;
  strTags?: string;
  [key: `strIngredient${number}`]: string;
  [key: `strMeasure${number}`]: string;
}

export default function Home() {
  const [meal, setMeal] = useState<Meal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]); // For search results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch random meal on initial load
  useEffect(() => {
    fetchRandomMeal();
  }, []);

  const fetchRandomMeal = async () => {
    try {
      setLoading(true);
      setIsSearching(false);
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
      );
      const data = await response.json();
      setMeal(data.meals[0]);
      setMeals([]); // Clear search results
    } catch (err) {
      setError("Failed to fetch meal data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchMeals = async (query: string) => {
    if (!query.trim()) {
      setMeals([]);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      const data = await response.json();
      if (data.meals) {
        setMeals(data.meals);
        setMeal(null); // Clear single meal view
      } else {
        setMeals([]);
      }
    } catch (err) {
      setError("Failed to search meals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMeals(searchQuery);
  };

  const getIngredients = (mealItem: Meal) => {
    if (!mealItem) return [];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = mealItem[`strIngredient${i}` as keyof Meal];
      const measure = mealItem[`strMeasure${i}` as keyof Meal];
      if (ingredient && ingredient.trim() !== "") {
        ingredients.push({ ingredient, measure });
      }
    }
    return ingredients;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Search Bar */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search for meals..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={fetchRandomMeal}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Random
            </button>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="max-w-4xl mx-auto mb-4">
          <h2 className="text-xl font-semibold mb-2">
            {meals.length > 0
              ? `Found ${meals.length} meals`
              : "No meals found"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {meals.map((mealItem) => (
              <div
                key={mealItem.idMeal}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setMeal(mealItem);
                  setIsSearching(false);
                }}
              >
                <Image
                  src={mealItem.strMealThumb}
                  alt={mealItem.strMeal}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">{mealItem.strMeal}</h3>
                  <p className="text-sm text-gray-500">{mealItem.strCategory}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Single Meal View */}
      {!isSearching && meal && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">{meal.strMeal}</h1>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="bg-blue-700 px-2 py-1 rounded">
                {meal.strCategory}
              </span>
              <span className="bg-blue-700 px-2 py-1 rounded">
                {meal.strArea}
              </span>
              {meal.strTags && (
                <span className="bg-blue-700 px-2 py-1 rounded">
                  {meal.strTags}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="md:w-1/3">
                <Image
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  width={400}
                  height={300}
                  className="rounded-lg object-cover w-full h-auto"
                />
                {meal.strYoutube && (
                  <a
                    href={meal.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    Watch on YouTube
                  </a>
                )}
              </div>

              {/* Details */}
              <div className="md:w-2/3">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">
                    Ingredients
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getIngredients(meal).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{item.ingredient}</p>
                          <p className="text-sm text-gray-500">{item.measure}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">
                Instructions
              </h2>
              <div className="prose max-w-none">
                {meal.strInstructions.split("\r\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Refresh button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={fetchRandomMeal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Get Another Random Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}