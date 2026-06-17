/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Search,
  Mic,
  Home,
  Map as MapIcon,
  MessageSquare,
  Navigation,
  Compass,
  History,
  ChevronRight,
  BookOpen,
  Coffee,
  School,
  Activity,
  Layers,
  MapPin,
  Laptop,
  CheckCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

import { CAMPUS_LOCATIONS, CAMPUS_CATEGORIES, RECENT_SEARCHES } from './campusData.ts';
import { CampusLocation, CampusCategory, ChatMessage, ActiveScreen, LocationCategory } from './types.ts';

export default function App() {
  // Screen and data state managers
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory>('all');
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation>(CAMPUS_LOCATIONS[0]); // Default to Library
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGlitchMode, setIsGlitchMode] = useState(false);

  // Directions state managers
  const [navigationActive, setNavigationActive] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);

  // Chat conversation state managers
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: "Hello! I'm your LASUSTECH Campus Guide. How can I help you find your way around today?",
      timestamp: 'Just now'
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keep chat scrolled down
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Handle location search filtering
  const filteredLocations = CAMPUS_LOCATIONS.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle live server chat request
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput.trim();
    if (!query) return;

    if (!textToSend) {
      setChatInput('');
    }

    // Append student client message
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `student-msg-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      // Send message to Express API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({
            sender: m.sender,
            content: m.content
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.response;
        
        // Scan for matching campus locations to add high-fidelity hotlinks for directions
        let targetId: string | undefined;
        let hasLink = false;
        
        for (const loc of CAMPUS_LOCATIONS) {
          if (responseText.toLowerCase().includes(loc.name.toLowerCase()) || 
              loc.name.toLowerCase().split(' ').some(word => word.length > 3 && responseText.toLowerCase().includes(word))) {
            targetId = loc.id;
            hasLink = true;
            break;
          }
        }

        setChatMessages(prev => [...prev, {
          id: `ai-msg-${Date.now()}`,
          sender: 'assistant',
          content: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasDirectionsLink: hasLink,
          directionsTargetId: targetId
        }]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch (err) {
      console.error("Fetch API error, falling back to offline advisor matching logic:", err);
      
      // Standalone client advisor fallback
      setTimeout(() => {
        let textResponse = `I'm analyzing your request for "${query}". Let's take a look at the campus directions page so you don't get lost!`;
        let linkedLocId: string | undefined;

        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('lib') || lowerQuery.includes('book')) {
          textResponse = "The Main Library is the large architectural study center with glass facades opposite the Central administrative gardens. It's open from 8:00 AM to 6:00 PM.";
          linkedLocId = 'library';
        } else if (lowerQuery.includes('eng') || lowerQuery.includes('cs') || lowerQuery.includes('computer')) {
          textResponse = "The Faculty of Engineering (Block L) is about 450m from the Main gate. That is where we have our computer science wing and innovation labs!";
          linkedLocId = 'engineering';
        } else if (lowerQuery.includes('food') || lowerQuery.includes('eat') || lowerQuery.includes('cafe')) {
          textResponse = "Head to the Student Center Cafeteria! It is 800m away (about 11 minutes brisk walk) and has awesome outdoor parasols, local swallow, rice, and snacks.";
          linkedLocId = 'student-center';
        } else if (lowerQuery.includes('auditorium')) {
          textResponse = "The Main Auditorium is currently open and is located near the School Senate flagpole around 800m away.";
          linkedLocId = 'auditorium';
        } else if (lowerQuery.includes('ict') || lowerQuery.includes('exam')) {
          textResponse = "The computerized ICT center is near the Faculty of Science corridors, about a 4-minute walk from here.";
          linkedLocId = 'ict-center';
        } else if (lowerQuery.includes('sport') || lowerQuery.includes('stadium') || lowerQuery.includes('field')) {
          textResponse = "The Sports Complex sits at the campus edge next to Block E, roughly 1.1km away. Great space for football, sprints, and basketball!";
          linkedLocId = 'sports-stadium';
        } else if (lowerQuery.includes('lecture') || lowerQuery.includes('theater')) {
          textResponse = "Lecture Theater 1 is a large 1000-seater amphitheatre on the north plaza, usually host to massive first year general studies lectures.";
          linkedLocId = 'lecture-theater-1';
        }

        setChatMessages(prev => [...prev, {
          id: `ai-msg-${Date.now()}`,
          sender: 'assistant',
          content: textResponse,
          timestamp: 'Just now',
          hasDirectionsLink: !!linkedLocId,
          directionsTargetId: linkedLocId
        }]);
      }, 750);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Launch Directions Navigation Simulation
  const handleStartNavigationSimulation = () => {
    setIsCalculatingRoute(true);
    setNavigationActive(false);
    setRouteProgress(0);

    setTimeout(() => {
      setIsCalculatingRoute(false);
      setNavigationActive(true);
      
      // Simulate micro-moving along path
      const interval = setInterval(() => {
        setRouteProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 1000);
    }, 1200);
  };

  // Quick select category icon
  const getCategoryIcon = (catId: LocationCategory) => {
    switch (catId) {
      case 'academic': return <School className="w-5 h-5 text-emerald-600" />;
      case 'food': return <Coffee className="w-5 h-5 text-emerald-600" />;
      case 'sports': return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'services': return <Laptop className="w-5 h-5 text-emerald-600" />;
      default: return <Compass className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-start items-center ${isGlitchMode ? 'bg-[#121010] text-[#00FFFF] font-mono' : 'bg-[#FAFAF9] text-[#1A1C1C] font-sans'}`}>
      
      {/* Glitch CRT static noise effects overlay */}
      {isGlitchMode && (
        <>
          <div className="scanline-overlay"></div>
          <div className="scanline-sweep"></div>
          <div className="absolute inset-0 static-noise-bg pointer-events-none opacity-40 z-30"></div>
        </>
      )}

      {/* Persistence Side Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-100"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className={`fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] p-6 z-101 flex flex-col justify-between ${isGlitchMode ? 'bg-[#121010] border-r-2 border-[#FF00FF]' : 'bg-[#FAFAF9] shadow-2xl rounded-r-3xl border-r border-[#E2E2E2]'}`}
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-6 h-6 ${isGlitchMode ? 'text-[#FF00FF]' : 'text-emerald-700'}`} />
                    <span className={`font-bold text-lg ${isGlitchMode ? 'text-white' : 'text-emerald-800'}`}>LASUSTECH Guide</span>
                  </div>
                  <button
                    id="menu-close-btn"
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isGlitchMode ? 'hover:bg-[#FF00FF]/20 text-[#00FFFF]' : 'hover:bg-[#EEEEEE] text-[#556158]'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className={`p-4 rounded-2xl ${isGlitchMode ? 'bg-[#FF00FF]/10 border border-[#00FFFF]' : 'bg-[#E8F5E9] border border-emerald-100'}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#556158]">Lagos State University of Science & Technology</p>
                  <p className="text-sm mt-2 opacity-90 leading-relaxed">
                    LASUSTECH is a top-tier science and vocational university upgraded in 2022. Found in the lively suburb of Ikorodu, Lagos, Nigeria. Its expansive campus is rich with gorgeous architectural centers.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1a1c1c] opacity-60">Navigate landmarks</span>
                  {CAMPUS_LOCATIONS.map(loc => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setCurrentScreen('map');
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${isGlitchMode ? 'hover:bg-[#00FFFF]/10 text-[#00FFFF]' : 'hover:bg-emerald-50 text-[#1a1c1c]'}`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="text-sm font-semibold">{loc.name}</p>
                        <p className="text-xs opacity-70">{loc.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="pt-4 border-t border-[#E2E2E2]/60 text-center">
                <span className="text-xs opacity-60">LASUSTECH AI Guide © 2026</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PERSISTENT VIEWCONTAINER WRAPPER */}
      <div className={`w-full max-w-md min-h-screen flex flex-col justify-between relative bg-inherit ${isGlitchMode ? 'shadow-[0_0_30px_rgba(0,180,180,0.2)] border-x border-[#FF00FF]/30' : 'shadow-xl'}`}>
        
        {/* Persistent App Header */}
        <header className={`px-5 py-4 flex justify-between items-center shrink-0 z-40 transition-colors ${isGlitchMode ? 'bg-[#121010]/95 border-b border-[#00FFFF]/30' : 'bg-white shadow-sm border-b border-[#E2E2E2]'}`}>
          <div className="flex items-center gap-3">
            <button
              id="sidebar-menu-btn"
              onClick={() => setIsMenuOpen(true)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${isGlitchMode ? 'bg-[#00FFFF]/10 text-[#00FFFF] hover:bg-[#FF00FF]/10' : 'bg-[#FAFAF9] hover:bg-[#eeeeee] text-[#0d631b]'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className={`font-extrabold text-lg tracking-tight ${isGlitchMode ? 'glitch-text text-white' : 'font-display text-emerald-800'}`}>
              {isGlitchMode ? 'SYS.COOR_TR-1090' : 'LASUSTECH Guide'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* AMAZING GLITCH MODE CONTROLLER */}
            <button
              id="glitch-toggle-btn"
              onClick={() => setIsGlitchMode(!isGlitchMode)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase transition-all duration-300 active:scale-95 ${
                isGlitchMode 
                  ? 'bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] text-black shadow-[0_0_8px_#ff00ff]' 
                  : 'bg-[#EEEEEE] hover:bg-emerald-50 text-[#556158] hover:text-[#0d631b] border border-transparent hover:border-emerald-200'
              }`}
            >
              {isGlitchMode ? '⚡ GLITCH_ON' : '⚙️ Glitch Mode'}
            </button>

            {/* Profile Avatar */}
            <div className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform active:scale-95 ${isGlitchMode ? 'border-[#FF00FF]' : 'border-emerald-600'}`}>
              <img
                alt="Student Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7eBrKSppUUXaCxSN1QgEhmGhZPz8g_dxbzIzj1Yu3JV-gC9wMDnl6WFyWSQbYCsD1HdFcGH5a7ccXTszOX7KALo1XpF1O_P9__cmUaPym1trsOxWu5aPexmT6qPniWilxpmfMIRqE9NJfB5O_81WwhygB5nII_GqO1yUYrc-fpA1QqaPaMdoVob6xnqWzF4iJdClDNfh1NkQJT6tfIwzsCf2QFxSc86ZrXIOTET7d6rB1YGJfRoNEf5cyWjM6UBmFuUeHSKkXYJo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* CONTAINER FRAME OF SCREEN CONTENT */}
        <main className="flex-grow overflow-y-auto pb-28 relative">
          
          {/* SCREEN 1: HOME SCREEN */}
          {currentScreen === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-5 py-6 space-y-6"
            >
              {/* Where to Heading */}
              <div>
                <h2 className={`text-2xl font-black ${isGlitchMode ? 'text-white' : 'font-display text-[#1a1c1c] tracking-tight'}`}>
                  {isGlitchMode ? 'INTRUDE PATHWAYS:' : 'Where to?'}
                </h2>
                <p className={`text-xs italic ${isGlitchMode ? 'text-[#FF00FF]' : 'text-[#556158]'}`}>
                  {isGlitchMode ? 'CALCULATING TARGET LOCATOR INDEX...' : 'Find your way around the campus with ease.'}
                </p>
              </div>

              {/* Dynamic Action Search Bar */}
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isGlitchMode ? 'text-[#00FFFF]' : 'text-[#707a6c]'}`} />
                <input
                  id="home-search-input"
                  type="text"
                  placeholder={isGlitchMode ? 'ACC_ROOT_DATABASE...' : 'Search Campus Buildings...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-14 pl-12 pr-12 text-sm focus:outline-none transition-all ${
                    isGlitchMode 
                      ? 'bg-black/80 border-2 border-[#FF00FF] rounded-none focus:border-[#00FFFF] placeholder-[#FF00FF]/50 text-white shadow-[0_0_12px_rgba(255,0,255,0.2)]'
                      : 'bg-white border-2 border-transparent focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 rounded-2xl placeholder-[#bfcaba] shadow-md'
                  }`}
                />
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 rounded-full transition-transform active:scale-95 ${isGlitchMode ? 'text-[#FF00FF]' : 'text-emerald-700 hover:bg-emerald-50'}`}
                >
                  {searchQuery ? <X className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>

              {/* Simple grid view for search outcome */}
              {searchQuery && (
                <div className={`p-4 rounded-2xl ${isGlitchMode ? 'bg-[#FF00FF]/5 border border-[#FF00FF]' : 'bg-white border border-[#E2E2E2]'} space-y-3`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Search Results ({filteredLocations.length})</p>
                  {filteredLocations.length === 0 ? (
                    <p className="text-sm opacity-70">No landmarks match your search query.</p>
                  ) : (
                    <div className="divide-y divide-[#E2E2E2]/60">
                      {filteredLocations.map(loc => (
                        <div
                          key={loc.id}
                          className="py-2.5 flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setSelectedLocation(loc);
                            setCurrentScreen('map');
                          }}
                        >
                          <div>
                            <p className="text-sm font-semibold">{loc.name}</p>
                            <p className="text-xs opacity-70">{loc.subtitle} ({loc.distance})</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-emerald-700" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Access Categories Carousel */}
              <div className="space-y-3">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isGlitchMode ? 'text-[#00FFFF]' : 'text-[#556158]'}`}>
                  {isGlitchMode ? 'CYCLICAL_ARRAYS:' : 'Quick Access Categories'}
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {CAMPUS_CATEGORIES.slice(1, 5).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentScreen('map');
                      }}
                      className="group flex flex-col items-center gap-2 transition-transform active:scale-95 duration-200 cursor-pointer"
                    >
                      <div className={`w-14 h-14 flex items-center justify-center transition-all ${
                        isGlitchMode 
                          ? 'bg-black border-2 border-[#00FFFF] rounded-none group-hover:border-[#FF00FF] text-[#00FFFF]' 
                          : 'bg-[#D9E6DA] hover:bg-emerald-100 rounded-3xl text-emerald-800 hover:text-emerald-950 shadow-sm'
                      }`}>
                        {getCategoryIcon(cat.id)}
                      </div>
                      <span className={`text-[10px] text-center font-semibold leading-tight opacity-90 ${isGlitchMode ? 'text-[#00FFFF]' : 'text-[#40493d]'}`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campus Map Preview Card */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <h3 className={`text-md font-extrabold ${isGlitchMode ? 'text-white' : 'font-display text-[#1a1c1c]'}`}>
                    {isGlitchMode ? 'SYS.TOPOLOGICAL_OVERLAY' : 'Campus Map'}
                  </h3>
                  <button
                    id="home-see-all-map-link"
                    onClick={() => setCurrentScreen('map')}
                    className={`text-xs font-bold ${isGlitchMode ? 'text-[#FF00FF]' : 'text-emerald-700 hover:underline'}`}
                  >
                    See all
                  </button>
                </div>
                
                <div
                  id="home-map-tile"
                  onClick={() => setCurrentScreen('map')}
                  className={`relative h-48 overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform ${isGlitchMode ? 'border-2 border-[#00FFFF] rounded-none' : 'rounded-3xl shadow-md border border-[#E2E2E2]'}`}
                >
                  <img
                    alt="Campus Map Preview"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5UUP-Kefq35L7BxHIKj988mAqOyUfB-A3SwNHxpA_VyKBYcO6JnSnCRHcToNOU5B5embeMg87vH2gtgBlqIhGrk49u21UxmDqxqK8FahJAyJiSliMFQb5otsgXteSQCO3tGlxCExVoCDKos6p92Q2z5-E1aa-Z0E0yEUFbqQoMyGAKXRwKXiojD0h5sk65jhvwYdEV4ABepxzP0wL-GsmI5fjjktMkXLn6att4fYT3m9rfgp9GOF8JSDAgjDSR37TD5GRgk99xyM"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      <div className="p-1.5 bg-emerald-700 text-[10px] uppercase font-bold tracking-widest rounded">
                        Currently at Main Gate
                      </div>
                    </div>
                  </div>
                  
                  <button className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${isGlitchMode ? 'bg-black border border-[#FF00FF] rounded-none text-[#FF00FF]' : 'bg-white rounded-2xl text-emerald-800'}`}>
                    <Compass className="w-5 h-5 animate-spin-slow" />
                  </button>
                </div>
              </div>

              {/* Recent Searches */}
              <div className="space-y-3">
                <h3 className={`text-sm font-extrabold uppercase tracking-wider ${isGlitchMode ? 'text-[#00FFFF]' : 'text-[#556158]'}`}>
                  {isGlitchMode ? 'CYCLES_STACK:' : 'Recent Location Enquiries'}
                </h3>
                <div className="space-y-2.5">
                  {RECENT_SEARCHES.map(search => {
                    const matchLoc = CAMPUS_LOCATIONS.find(loc => loc.name === search.name);
                    return (
                      <div
                        key={search.id}
                        onClick={() => {
                          if (matchLoc) setSelectedLocation(matchLoc);
                          setCurrentScreen('directions');
                        }}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                          isGlitchMode 
                            ? 'bg-black/50 border border-[#00FFFF]/40 hover:bg-[#00FFFF]/10 rounded-none' 
                            : 'bg-[#F3F3F3] hover:bg-[#EAEAEA] rounded-2xl'
                        }`}
                      >
                        <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${isGlitchMode ? 'bg-[#00FFFF]/10 text-[#00FFFF]' : 'bg-[#E8E8E8] text-[#556158]'}`}>
                          <History className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold">{search.name}</p>
                          <p className="text-[11px] opacity-80">{search.distance} • {search.status}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isGlitchMode ? 'text-[#FF00FF]' : 'text-[#707a6c]'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive AI Guide Promo Banner */}
              <div className={`p-6 relative overflow-hidden flex flex-col gap-3 ${
                isGlitchMode 
                  ? 'bg-black border-2 border-[#FF00FF] rounded-none shadow-[0_0_15px_rgba(255,0,255,0.4)]' 
                  : 'bg-emerald-800 text-white rounded-3xl shadow-lg shadow-emerald-950/15'
              }`}>
                <div className="relative z-10 space-y-1">
                  <h4 className={`text-md font-bold ${isGlitchMode ? 'text-white' : 'font-display'}`}>
                    {isGlitchMode ? 'AI_ENGINE: ANTIGRAVITY' : 'Ask AI anything'}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {isGlitchMode ? 'COMPILATION CYCLE PROTOCOL STACK FOR GEOMETRIC SPATIAL NAVIGATION.' : 'Need help finding the fastest route, lecture rooms, or cafeteria menus? Chat with our smart assistant!'}
                  </p>
                </div>
                
                <button
                  id="home-promo-chat-btn"
                  onClick={() => setCurrentScreen('chat')}
                  className={`relative z-10 self-start px-6 py-2.5 font-bold text-xs uppercase cursor-pointer rounded-full active:scale-95 transition-transform ${
                    isGlitchMode 
                      ? 'bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] text-black shadow-lg' 
                      : 'bg-[#cbffc2] text-[#002204] hover:bg-white'
                  }`}
                >
                  {isGlitchMode ? 'INITIATE_CHAT' : 'Chat Now'}
                </button>

                <MessageSquare className={`absolute -bottom-6 -right-6 text-9xl opacity-10 rotate-12 ${isGlitchMode ? 'text-[#00FFFF]' : 'text-white'}`} />
              </div>

            </motion.div>
          )}

          {/* SCREEN 2: INTERACTIVE MAP VIEW SCREEN */}
          {currentScreen === 'map' && (
            <div className="h-full flex flex-col justify-start relative">
              
              {/* Floating control search overlay */}
              <div className="absolute top-4 left-4 right-4 z-20 flex gap-2">
                <div className={`flex items-center gap-3 px-4 h-12 flex-grow ${isGlitchMode ? 'bg-black/90 border border-[#FF00FF]' : 'bg-white shadow-lg rounded-full border border-white/20'}`}>
                  <Search className={`w-5 h-5 ${isGlitchMode ? 'text-[#00FFFF]' : 'text-[#707a6c]'}`} />
                  <input
                    id="map-embedded-search"
                    type="text"
                    placeholder={isGlitchMode ? 'FILTER SECTORS...' : 'Search Nearby Campus...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none focus:outline-none flex-grow text-xs placeholder:text-neutral-400 py-1"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-4 h-4 text-neutral-500" />
                    </button>
                  )}
                </div>

                <button
                  id="map-recenter-btn"
                  onClick={() => {
                    setSelectedLocation(CAMPUS_LOCATIONS[0]);
                    setSelectedCategory('all');
                  }}
                  className={`w-12 h-12 flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isGlitchMode ? 'bg-black border border-[#00FFFF] text-[#00FFFF]' : 'bg-white rounded-2xl text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                </button>
              </div>

              {/* FLOATING ACTION CONTROL TOOLS */}
              <div className="absolute right-4 top-20 z-20 flex flex-col gap-2">
                <button
                  onClick={() => {
                    // Alert coordinate info
                    if (selectedLocation) {
                      handleSendMessage(`Where is the ${selectedLocation.name}?`);
                      setCurrentScreen('chat');
                    }
                  }}
                  className={`w-11 h-11 flex items-center justify-center shadow-md active:scale-95 transition-all ${
                    isGlitchMode ? 'bg-black border border-[#FF00FF] text-[#00FFFF]' : 'bg-white rounded-xl text-[#0d631b]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button className={`w-11 h-11 flex items-center justify-center shadow-md ${
                  isGlitchMode ? 'bg-black border border-[#FF00FF] text-[#FF00FF]' : 'bg-white rounded-xl text-neutral-500'
                }`}>
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              {/* VIRTUAL SATELLITE MAP AREA */}
              <div className="relative w-full h-[52vh] bg-neutral-200 overflow-hidden shrink-0">
                <img
                  alt="LASUSTECH Interactive Map Overlay"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUlUwQDE_4LMknecYRGki5-PC1qyQ96tfM2nTDkUg4qXXGtJbUcqXkqbYDbiRrXZXISCVowEJ7v2TDDVM8t1hDIEGxFdX9j_wexCriOAQhFU3uVbYoF3qdvkfopNnfTQqoVIEyfODU8S2gYCJY2iQhlXJU7-Xen9Vd5BbSgLvya6KVSr7Q-0ElUhVtto1-iqQZ8Pqvs9TJO7t6CWfH61Ws_uNXv9A1VMMgSbl0rKQyfx2bpkBePgqJP2add_ma0ZTiKTAToF-Fq8Q"
                  className="w-full h-full object-cover select-none"
                />

                {/* Overlaid markers dynamically placed */}
                {CAMPUS_LOCATIONS.map(loc => {
                  const isActive = selectedLocation?.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      style={{ top: `${loc.coordinates.y}%`, left: `${loc.coordinates.x}%` }}
                      className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group z-10 transition-transform hover:scale-110"
                    >
                      <div className={`p-2 rounded-xl shadow-lg transition-transform ${
                        isActive 
                          ? isGlitchMode 
                            ? 'bg-[#FF00FF] text-black scale-125 shadow-[0_0_12px_#ff00ff]'
                            : 'bg-emerald-800 text-white scale-125 shadow-[0_0_12px_rgba(13,99,27,0.5)]'
                          : isGlitchMode
                            ? 'bg-black border border-[#00FFFF] text-[#00FFFF]'
                            : 'bg-white border text-[#556158] hover:text-[#0d631b]'
                      }`}>
                        {loc.icon === 'book' && <BookOpen className="w-4 h-4" />}
                        {loc.icon === 'engineering' && <Laptop className="w-4 h-4" />}
                        {loc.icon === 'groups' && <Coffee className="w-4 h-4" />}
                        {loc.icon !== 'book' && loc.icon !== 'engineering' && loc.icon !== 'groups' && <MapPin className="w-4 h-4" />}
                      </div>

                      {/* Pill tooltip element */}
                      {isActive && (
                        <div className={`px-2 py-0.5 rounded-full shadow-md mt-1.5 text-[9px] font-extrabold uppercase border z-20 ${
                          isGlitchMode 
                            ? 'bg-black text-[#FF00FF] border-[#FF00FF]' 
                            : 'bg-white text-emerald-800 border-emerald-100'
                        }`}>
                          {loc.name.split(' ')[1] || loc.name}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* BOTTOM EXPANDABLE PULL-UP SHEET */}
              <div className={`flex flex-col flex-grow ${
                isGlitchMode ? 'bg-[#121010] border-t-2 border-[#00FFFF]' : 'bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)]'
              }`}>
                {/* Drag handle line decoration */}
                <div className="w-full flex justify-center py-3">
                  <div className="w-12 h-1.5 bg-[#bfcaba]/60 rounded-full" />
                </div>

                <div className="px-5 pb-2">
                  <h2 className="text-md font-extrabold text-inherit mb-3">
                    {isGlitchMode ? 'SECTOR_FACILITIES_STACK:' : 'Nearby Campus Places'}
                  </h2>
                  
                  {/* Category Filter Chips */}
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 shrink-0">
                    {CAMPUS_CATEGORIES.map(cat => {
                      const isCatActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                            isCatActive 
                              ? isGlitchMode 
                                ? 'bg-[#00FFFF] text-black border border-[#00FFFF]' 
                                : 'bg-emerald-800 text-white' 
                              : isGlitchMode 
                                ? 'bg-black border border-[#FF00FF]/40 text-[#FF00FF]' 
                                : 'bg-[#F3F3F3] text-[#556158] hover:bg-[#EAEAEA]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vertical Scroll Landmarked Lists */}
                <div className="flex-grow overflow-y-auto px-5 pb-6 space-y-3 shrink-1">
                  {filteredLocations.map(loc => {
                    const isLocInspected = selectedLocation?.id === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc)}
                        className={`flex gap-4 p-3.5 transition-all text-left cursor-pointer active:scale-99 border ${
                          isLocInspected 
                            ? isGlitchMode 
                              ? 'bg-[#FF00FF]/15 border-[#FF00FF]' 
                              : 'bg-[#D9E6DA] border-emerald-500/20' 
                            : isGlitchMode 
                              ? 'bg-black border-[#00FFFF]/30 hover:bg-[#00FFFF]/5' 
                              : 'bg-white border-[#E2E2E2] hover:bg-[#FAF9F6]'
                        }`}
                        style={{ borderRadius: isGlitchMode ? '0px' : '20px' }}
                      >
                        {/* thumbnail image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#E8E8E8]">
                          <img
                            alt={loc.name}
                            src={loc.image}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* info details */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold leading-tight">{loc.name}</h4>
                              
                              {isLocInspected && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest ${
                                  isGlitchMode ? 'bg-[#FF00FF]/25 text-[#FF00FF]' : 'bg-emerald-700 text-white'
                                }`}>
                                  INSPECT
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] opacity-80 mt-0.5">{loc.subtitle}</p>
                          </div>

                          {/* timing metadata */}
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center text-xs text-emerald-800 font-medium">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              <span>{loc.distance}</span>
                            </div>
                            <div className="flex items-center text-xs text-emerald-800 font-medium">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              <span>{loc.walkTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredLocations.length === 0 && (
                    <div className="text-center py-6 opacity-60 text-sm">
                      No sectors match the category filter.
                    </div>
                  )}
                </div>

                {/* Inspect Drawer Actions overlay */}
                {selectedLocation && (
                  <div className={`p-4 shrink-0 flex items-center justify-between border-t ${isGlitchMode ? 'bg-black border-[#00FFFF]/50' : 'bg-[#E8F5E9] border-emerald-100'}`}>
                    <p className="text-xs font-bold truncate pr-3">
                      Selected: <span className={isGlitchMode ? 'text-white' : 'text-emerald-950'}>{selectedLocation.name}</span>
                    </p>
                    <button
                      id="map-action-navigate-btn"
                      onClick={() => {
                        setCurrentScreen('directions');
                        handleStartNavigationSimulation();
                      }}
                      className={`px-4 py-2 text-xs font-bold uppercase rounded-full tracking-wider transition-transform active:scale-95 flex items-center gap-1.5 ${
                        isGlitchMode ? 'bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] text-black' : 'bg-emerald-800 text-white'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Go Directions
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* SCREEN 3: AI CHAT SCREEN */}
          {currentScreen === 'chat' && (
            <div className="h-full flex flex-col justify-between relative bg-inherit">
              
              {/* CHAT THREAD CANVAS */}
              <div id="chat-scroller" className="flex-grow overflow-y-auto px-5 py-6 space-y-4 hide-scrollbar pb-32">
                {chatMessages.map((msg) => {
                  const isAssistant = msg.sender === 'assistant';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] space-y-1 ${isAssistant ? 'items-start' : 'items-end self-end ml-auto'}`}
                    >
                      {/* Message Bubble container */}
                      <div className={`p-4 transition-all shadow-sm ${
                        isAssistant
                          ? isGlitchMode
                            ? 'bg-[#00FFFF]/10 border border-[#00FFFF]/50 text-white rounded-none rounded-br-2xl'
                            : 'bg-[#D9E6DA]/70 text-[#0d631b] rounded-2xl rounded-bl-sm border border-emerald-100/40'
                          : isGlitchMode
                            ? 'bg-[#FF00FF]/15 border border-[#FF00FF]/50 text-[#00FFFF] rounded-none rounded-bl-2xl'
                            : 'bg-white text-[#1a1c1c] rounded-2xl rounded-br-sm border border-[#E2E2E2]'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        {/* HOTLINK TRANSITION LINK FOR CHAT MAP CONNECTIONS */}
                        {isAssistant && msg.hasDirectionsLink && msg.directionsTargetId && (
                          <button
                            onClick={() => {
                              const target = CAMPUS_LOCATIONS.find(l => l.id === msg.directionsTargetId);
                              if (target) {
                                setSelectedLocation(target);
                                setCurrentScreen('directions');
                                handleStartNavigationSimulation();
                              }
                            }}
                            className={`mt-3.5 w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold uppercase transition-all active:scale-95 ${
                              isGlitchMode 
                                ? 'bg-black border border-[#FF00FF] text-[#00FFFF] hover:bg-[#FF00FF]/15'
                                : 'bg-[#0d631b] hover:bg-[#208331] text-white'
                            }`}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Locate on Map</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <span className="text-[10px] text-neutral-400 font-semibold px-2">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* AI TYPING SIMULATOR */}
                {isAiTyping && (
                  <div className="flex flex-col items-start max-w-[85%] space-y-1">
                    <div className={`p-4 ${isGlitchMode ? 'bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-none' : 'bg-[#D9E6DA]/45 rounded-2xl rounded-bl-sm'} flex items-center gap-1.5`}>
                      <span className={`text-[11px] font-bold ${isGlitchMode ? 'text-[#FF00FF]' : 'text-emerald-800'}`}>
                        {isGlitchMode ? 'COMPILING_VECTOR...' : 'Calculating route details...'}
                      </span>
                      <RefreshCw className={`w-3.5 h-3.5 animate-spin ${isGlitchMode ? 'text-[#FF00FF]' : 'text-emerald-800'}`} />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* FLOATING CONTROLLER SEARCH FOOTER BOX */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
                isGlitchMode ? 'bg-[#121010]/95 border-[#00FFFF]/40' : 'bg-white/80 glass-effect border-[#E2E2E2]'
              }`}>
                {/* Suggestions Chips Carousel */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 shrink-0">
                  <button
                    onClick={() => handleSendMessage("Find me the nearest library")}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-transform active:scale-95 cursor-pointer rounded-full border ${
                      isGlitchMode 
                        ? 'bg-black border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF]/10' 
                        : 'bg-white border-[#E2E2E2] text-[#556158] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    Nearest Library
                  </button>
                  <button
                    onClick={() => handleSendMessage("Where is the nearest restroom?")}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-transform active:scale-95 cursor-pointer rounded-full border ${
                      isGlitchMode 
                        ? 'bg-black border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF]/10' 
                        : 'bg-white border-[#E2E2E2] text-[#556158] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    Restroom
                  </button>
                  <button
                    onClick={() => handleSendMessage("Tell me ICT registration details")}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-transform active:scale-95 cursor-pointer rounded-full border ${
                      isGlitchMode 
                        ? 'bg-black border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF]/10' 
                        : 'bg-white border-[#E2E2E2] text-[#556158] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    ICT Center
                  </button>
                  <button
                    onClick={() => handleSendMessage("Where is the Cafeteria?")}
                    className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-transform active:scale-95 cursor-pointer rounded-full border ${
                      isGlitchMode 
                        ? 'bg-black border-[#FF00FF] text-[#FF00FF] hover:bg-[#FF00FF]/10' 
                        : 'bg-white border-[#E2E2E2] text-[#556158] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    Cafeteria Menu
                  </button>
                </div>

                {/* Main sending bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className={`flex items-center gap-2 p-1.5 ${isGlitchMode ? 'bg-black border border-[#00FFFF]' : 'bg-[#FAFAF9] rounded-full border border-neutral-200'}`}
                >
                  <input
                    id="chat-bar-input"
                    type="text"
                    placeholder={isGlitchMode ? 'ENTRY_CODE...' : 'Ask about buildings, wifi, restrooms...'}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-grow bg-transparent border-none text-xs focus:outline-none px-3 py-2"
                  />
                  
                  <button
                    id="chat-send-submit-btn"
                    type="submit"
                    className={`p-3 cursor-pointer flex items-center justify-center transition-transform active:scale-90 ${
                      isGlitchMode ? 'bg-[#FF00FF] text-black rounded-none' : 'bg-emerald-800 text-white rounded-full hover:bg-emerald-900'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5 rotate-90" />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* SCREEN 4: DIRECTIONS DETAILS RESULT SCREEN */}
          {currentScreen === 'directions' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* STYLIZED 3D GRAPHICAL HEADING BAR */}
              <div className="relative w-full h-64 overflow-hidden shrink-0 bg-neutral-800">
                <img
                  alt="Stylized Route Visual Illustration"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwZLDPzPFRum8G_322n65rCGyNK_9BupSMvmKyIS0QaHmx3AHiobwg61mDbi9sTwB3co0MauIBKcRqjMaNwIq19dzRDXXTqQg-_0AZqj17MLvFJQZomoYefCVJCJnnVVgqlIAuiYbxbkelwjMeRYR1T6UJLmxeJrX4hQzg80iE_SihHAu5yT6VfZqo6nS82NWiL6otGfUl_ATaIt0tAVINB7o6N-NMDWYX0U-EdNqXd39u7s04OIvD4XhYZiGHF8EktP4zMWX8C1Q"
                  className="w-full h-full object-cover select-none"
                />

                {/* Glowing Overlay floating metadata panel */}
                <div className={`absolute bottom-4 left-5 right-5 p-4 flex justify-between items-center ${
                  isGlitchMode ? 'bg-black/90 border border-[#FF00FF]' : 'bg-white/80 glass-effect rounded-2xl shadow-md border border-white/20'
                }`}>
                  <div>
                    <p className={`text-[9px] font-extrabold uppercase tracking-widest ${isGlitchMode ? 'text-[#00FFFF]' : 'text-[#707a6c]'}`}>
                      {isGlitchMode ? 'VECTOR_PATH_SELECTED' : 'Fastest Route'}
                    </p>
                    <p className={`text-lg font-black ${isGlitchMode ? 'text-white' : 'text-emerald-800'}`}>
                      {selectedLocation.walkTime} <span className="text-xs font-normal opacity-80">({selectedLocation.distance})</span>
                    </p>
                  </div>

                  <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full flex items-center gap-1 ${
                    isGlitchMode ? 'bg-[#FF00FF]/25 text-[#FF00FF]' : 'bg-[#cbffc2] text-emerald-800'
                  }`}>
                    🏃 Walk
                  </span>
                </div>
              </div>

              {/* DIRECTIONS TIMECOUNTER BOX */}
              <div className="px-5 space-y-4">
                
                {/* Timeline endpoints Card */}
                <div className={`p-4 flex flex-col gap-3 ${
                  isGlitchMode ? 'bg-black border border-[#00FFFF]' : 'bg-[#FAFAF9] border border-[#E2E2E2] rounded-2xl shadow-sm'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-400 uppercase">Start Location</p>
                      <p className="text-sm font-bold">Currently at Campus Hub</p>
                    </div>
                  </div>
                  
                  <div className="w-0.5 h-6 border-l-2 border-dashed border-[#bfcaba] ml-1.5" />
                  
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-400 uppercase">Target Location</p>
                      <p className="text-sm font-black text-inherit">{selectedLocation.name}</p>
                    </div>
                  </div>
                </div>

                {/* Step Timeline Lists header */}
                <h3 className={`text-sm font-black uppercase tracking-wider ${isGlitchMode ? 'text-[#FF00FF]' : 'text-neutral-500'}`}>
                  {isGlitchMode ? 'SEQ_TRAJECTORY_NODES:' : 'Step-by-step directions'}
                </h3>

                {/* Step timeline timeline items */}
                <div className="space-y-4 relative pl-3">
                  <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-[#E2E2E2]" />

                  {selectedLocation.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative z-10">
                      
                      {/* Round timeline circle */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                        navigationActive && routeProgress >= (idx + 1) * 25
                          ? isGlitchMode 
                            ? 'bg-[#00FFFF] text-black border-[#00FFFF]'
                            : 'bg-emerald-800 text-white border-emerald-300'
                          : isGlitchMode
                            ? 'bg-black border-[#FF00FF] text-[#00FFFF]'
                            : 'bg-white border-[#E2E2E2] text-emerald-800'
                      }`}>
                        {idx === 0 && <Compass className="w-4 h-4" />}
                        {idx === 1 && <School className="w-4 h-4" />}
                        {idx >= 2 && <MapPin className="w-4 h-4" />}
                      </div>

                      {/* Direction step description text */}
                      <div className="pt-1.5">
                        <p className={`text-sm leading-relaxed ${
                          navigationActive && routeProgress >= (idx + 1) * 25 ? 'font-bold opacity-100' : 'opacity-85'
                        }`}>
                          {step}
                        </p>
                        <p className="text-xs opacity-55 mt-0.5">30-40 meters spacing</p>
                      </div>

                    </div>
                  ))}

                  {/* Destination final marker */}
                  <div className="flex gap-4 items-start relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      navigationActive && routeProgress === 100
                        ? 'bg-red-600 text-white border-red-300'
                        : isGlitchMode
                          ? 'bg-black border-[#00FFFF]/40 text-[#00FFFF]'
                          : 'bg-white border-[#E2E2E2] text-neutral-500'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-sm font-bold">Arrive Safely at {selectedLocation.name}</p>
                      <p className="text-xs opacity-55 mt-0.5">Destination on your left quadrant</p>
                    </div>
                  </div>
                </div>

                {/* Start Navigation Interactive progress triggers */}
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    id="directions-simulation-trigger-btn"
                    onClick={handleStartNavigationSimulation}
                    disabled={isCalculatingRoute}
                    className={`w-full py-4 font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-97 cursor-pointer ${
                      isCalculatingRoute 
                        ? 'opacity-80' 
                        : 'opacity-100'
                    } ${
                      isGlitchMode 
                        ? 'bg-black border-2 border-[#FF00FF] text-[#FF00FF]' 
                        : 'bg-emerald-800 text-white rounded-2xl shadow-lg hover:bg-emerald-900 shadow-emerald-800/10'
                    }`}
                  >
                    {isCalculatingRoute ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Recalculating vectors...</span>
                      </>
                    ) : navigationActive ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Navigation active ({routeProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        <span>Start Navigation Simulation</span>
                      </>
                    )}
                  </button>
                  
                  {navigationActive && (
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${routeProgress}%` }} />
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </main>

        {/* PERSISTENT VIEW NAVIGATION TABS */}
        <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 py-4.5 z-40 flex justify-around items-center rounded-t-3xl transition-all ${
          isGlitchMode 
            ? 'bg-[#121010]/95 border-t-2 border-[#FF00FF]/60 text-[#00FFFF]' 
            : 'bg-white/90 glass-effect border-t border-[#E2E2E2] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]'
        }`}>
          
          <button
            id="nav-tab-home"
            onClick={() => {
              setCurrentScreen('home');
              setSearchQuery('');
            }}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${
              currentScreen === 'home' 
                ? isGlitchMode 
                  ? 'text-white border-b-2 border-[#00FFFF] pb-1'
                  : 'bg-emerald-800 text-white px-5 py-1.5 rounded-full shadow-sm'
                : 'text-[#556158] hover:text-[#0d631b]'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            {currentScreen !== 'home' && <span className="text-[10px] font-bold uppercase mt-1">Home</span>}
            {currentScreen === 'home' && isGlitchMode && <span className="text-[9px] font-black uppercase mt-0.5">SYS.HOME</span>}
          </button>

          <button
            id="nav-tab-map"
            onClick={() => {
              setCurrentScreen('map');
              setSearchQuery('');
            }}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${
              currentScreen === 'map' 
                ? isGlitchMode 
                  ? 'text-white border-b-2 border-[#00FFFF] pb-1'
                  : 'bg-emerald-800 text-white px-5 py-1.5 rounded-full shadow-sm'
                : 'text-[#556158] hover:text-[#0d631b]'
            }`}
          >
            <MapIcon className="w-5 h-5 shrink-0" />
            {currentScreen !== 'map' && <span className="text-[10px] font-bold uppercase mt-1">Map</span>}
            {currentScreen === 'map' && isGlitchMode && <span className="text-[9px] font-black uppercase mt-0.5">SYS.GRID</span>}
          </button>

          <button
            id="nav-tab-chat"
            onClick={() => {
              setCurrentScreen('chat');
              setSearchQuery('');
            }}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${
              currentScreen === 'chat' 
                ? isGlitchMode 
                  ? 'text-white border-b-2 border-[#00FFFF] pb-1'
                  : 'bg-emerald-800 text-white px-5 py-1.5 rounded-full shadow-sm'
                : 'text-[#556158] hover:text-[#0d631b]'
            }`}
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            {currentScreen !== 'chat' && <span className="text-[10px] font-bold uppercase mt-1">AI Chat</span>}
            {currentScreen === 'chat' && isGlitchMode && <span className="text-[9px] font-black uppercase mt-0.5">SYS.CYBER</span>}
          </button>

          <button
            id="nav-tab-directions"
            onClick={() => {
              setCurrentScreen('directions');
              setSearchQuery('');
            }}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 ${
              currentScreen === 'directions' 
                ? isGlitchMode 
                  ? 'text-white border-b-2 border-[#00FFFF] pb-1'
                  : 'bg-emerald-800 text-white px-5 py-1.5 rounded-full shadow-sm'
                : 'text-[#556158] hover:text-[#0d631b]'
            }`}
          >
            <Navigation className="w-5 h-5 shrink-0" />
            {currentScreen !== 'directions' && <span className="text-[10px] font-bold uppercase mt-1">Directions</span>}
            {currentScreen === 'directions' && isGlitchMode && <span className="text-[9px] font-black uppercase mt-0.5">SYS.VECT</span>}
          </button>

        </nav>

      </div>
    </div>
  );
}
