// src/app/practice/community/page.tsx
"use client";
import { Users, Mic, MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';

const groups = [
  {
    id: 1,
    name: "English for Interviews",
    topic: "Job interview practice",
    members: 124,
    active: true
  },
  {
    id: 2,
    name: "Movie Lovers",
    topic: "Discussing films & TV shows",
    members: 89,
    active: true
  },
  {
    id: 3,
    name: "Tech Enthusiasts",
    topic: "Technology discussions",
    members: 76,
    active: false
  },
  {
    id: 4,
    name: "Travel Chat",
    topic: "Share travel experiences",
    members: 53,
    active: true
  },
];

const scenarios = [
  "Job Interview",
  "Hotel Check-in",
  "Restaurant Ordering",
  "Business Meeting",
  "Airport Announcement"
];

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-25 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Users className="w-8 h-8 text-indigo-600" /> Community Practice
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Scenarios */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Practice Scenarios</h2>
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario}
                onClick={() => setSelectedScenario(scenario)}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-indigo-50 ${selectedScenario === scenario ? 'bg-indigo-100 border-indigo-300' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <Mic className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="font-medium">{scenario}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Groups */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Discussion Groups</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredGroups.map((group) => (
              <div key={group.id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${group.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {group.active ? 'Active now' : 'Offline'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{group.topic}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{group.members} members</span>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedScenario && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Selected Scenario: {selectedScenario}</h3>
              <p className="text-gray-600 mb-3">
                Join a group or start a new conversation to practice this scenario.
              </p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Find Matching Groups
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}