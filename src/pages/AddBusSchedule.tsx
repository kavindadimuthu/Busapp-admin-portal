import { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

export default function AddBusSchedule() {
  // State for form data
  const [formData, setFormData] = useState({
    operator: {
      name: '',
      contact_info: '',
      type: 'Private'
    },
    bus: {
      bus_number: '',
      name: '',
      type: 'Non-AC',
      fare: 0
    },
    route: {
      name: '',
      source_stop: {
        name: '',
        city: '',
        location: 'POINT(0 0)'
      },
      destination_stop: {
        name: '',
        city: '',
        location: 'POINT(0 0)'
      },
      total_distance: 0,
      total_duration: 0,
      stops: []
    },
    schedule: {
      valid_from: '',
      valid_until: '',
      journeys: [{
        departure_time: '',
        arrival_time: '',
        days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        stop_times: []
      }]
    }
  });

  // State for intermediate stops
  const [intermediateStops, setIntermediateStops] = useState([{ name: '', city: '', location: 'POINT(0 0)', sequence: 2 }]);
  
  // State for journey stop times
  // const [stopTimes, setStopTimes] = useState([]);
  
  // State for loading and success message
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle form field changes
  const handleChange = (
    section: 'operator' | 'bus' | 'route' | 'schedule',
    field: string,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle nested field changes
  const handleNestedChange = (
    section: 'route',
    subsection: 'source_stop' | 'destination_stop',
    field: string,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  // Handle journey field changes
  const handleJourneyChange = (
    index: number,
    field: string,
    value: string | number | string[]
  ) => {
    setFormData(prev => {
      const journeys = [...prev.schedule.journeys];
      journeys[index] = { ...journeys[index], [field]: value };
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          journeys
        }
      };
    });
  };

  // Handle journey days of week
  const handleDayToggle = (
    index: number,
    day: string
  ) => {
    setFormData(prev => {
      const journeys = [...prev.schedule.journeys];
      const journey = journeys[index];
      
      if (journey.days_of_week.includes(day)) {
        journey.days_of_week = journey.days_of_week.filter(d => d !== day);
      } else {
        journey.days_of_week = [...journey.days_of_week, day];
      }
      
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          journeys
        }
      };
    });
  };

  // Add more intermediate stops
  const addIntermediateStop = () => {
    setIntermediateStops([
      ...intermediateStops, 
      { 
        name: '', 
        city: '', 
        location: 'POINT(0 0)', 
        sequence: intermediateStops.length + 2 
      }
    ]);
  };

  // Handle intermediate stop changes
  const handleStopChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedStops = [...intermediateStops];
    updatedStops[index] = { ...updatedStops[index], [field]: value };
    setIntermediateStops(updatedStops);
  };

  // Delete intermediate stop
  const removeStop = (index: number) => {
    const updatedStops = intermediateStops.filter((_, i) => i !== index);
    
    // Resequence the stops
    const resequenced = updatedStops.map((stop, i) => ({
      ...stop,
      sequence: i + 2 // Start from 2 as 1 is source
    }));
    
    setIntermediateStops(resequenced);
  };

  // Set GPS coordinates for a stop
  const handleLocationChange = (
    type: 'source' | 'destination' | 'intermediate',
    index: number | null,
    lat: number | string,
    lng: number | string
  ) => {
    const point = `POINT(${lng} ${lat})`;
    
    if (type === 'source') {
      handleNestedChange('route', 'source_stop', 'location', point);
    } else if (type === 'destination') {
      handleNestedChange('route', 'destination_stop', 'location', point);
    } else if (type === 'intermediate' && index !== null) {
      // Add null check here ☝️
      const updatedStops = [...intermediateStops];
      updatedStops[index] = { ...updatedStops[index], location: point };
      setIntermediateStops(updatedStops);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Prepare stops array from intermediate stops
      const stops = intermediateStops.filter(stop => stop.name.trim() !== '');
      
      // Prepare the final data object
      const submitData = {
        ...formData,
        route: {
          ...formData.route,
          stops
        }
      };
      
      // Call the API
      const response = await axios.post('http://localhost:5000/schedule/bulk', [submitData]);
      
      setMessage({
        type: 'success',
        text: `Schedule created successfully! Schedule ID: ${response.data.schedules[0].schedule_id}`
      });
      
      // Reset form
      setFormData({
        operator: {
          name: '',
          contact_info: '',
          type: 'Private'
        },
        bus: {
          bus_number: '',
          name: '',
          type: 'Non-AC',
          fare: 0
        },
        route: {
          name: '',
          source_stop: {
            name: '',
            city: '',
            location: 'POINT(0 0)'
          },
          destination_stop: {
            name: '',
            city: '',
            location: 'POINT(0 0)'
          },
          total_distance: 0,
          total_duration: 0,
          stops: []
        },
        schedule: {
          valid_from: '',
          valid_until: '',
          journeys: [{
            departure_time: '',
            arrival_time: '',
            days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            stop_times: []
          }]
        }
      });
      setIntermediateStops([{ name: '', city: '', location: 'POINT(0 0)', sequence: 2 }]);
      
    } catch (error: unknown) {
      // Option 1: Type guard
      let errorMessage = 'An unknown error occurred';
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { 
          message: string; 
          response?: { 
            data?: { 
              details?: string 
            } 
          } 
        };
        errorMessage = err.response?.data?.details || err.message;
      }
      
      setMessage({
        type: 'error',
        text: `Error: ${errorMessage}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Add New Bus Schedule</h1>
      
        {message.text && (
          <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
      
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Operator Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Operator Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Operator Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.operator.name}
                  onChange={(e) => handleChange('operator', 'name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Info</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.operator.contact_info}
                  onChange={(e) => handleChange('operator', 'contact_info', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.operator.type}
                  onChange={(e) => handleChange('operator', 'type', e.target.value)}
                  required
                >
                  <option value="Private">Private</option>
                  <option value="CTB">CTB</option>
                </select>
              </div>
            </div>
          </div>
      
          {/* Bus Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bus Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bus Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.bus.bus_number}
                  onChange={(e) => handleChange('bus', 'bus_number', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bus Name (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.bus.name}
                  onChange={(e) => handleChange('bus', 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bus Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.bus.type}
                  onChange={(e) => handleChange('bus', 'type', e.target.value)}
                  required
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                  <option value="Express">Express</option>
                  <option value="Local">Local</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Fare</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.bus.fare}
                  onChange={(e) => handleChange('bus', 'fare', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>
      
          {/* Route Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Route Information</h2>
      
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Route Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.route.name}
                onChange={(e) => handleChange('route', 'name', e.target.value)}
                required
              />
            </div>
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Source Stop */}
              <div className="border p-4 rounded-lg">
                <h3 className="font-medium mb-3">Source Stop</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stop Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={formData.route.source_stop.name}
                      onChange={(e) => handleNestedChange('route', 'source_stop', 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={formData.route.source_stop.city}
                      onChange={(e) => handleNestedChange('route', 'source_stop', 'city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="e.g., 12.9716"
                        step="0.000001"
                        onChange={(e) => {
                          const match = formData.route.source_stop.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
                          const lng = match ? match[1] : 0;
                          handleLocationChange('source', null, e.target.value, lng);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="e.g., 77.5946"
                        step="0.000001"
                        onChange={(e) => {
                          const match = formData.route.source_stop.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
                          const lat = match ? match[2] : 0;
                          handleLocationChange('source', null, lat, e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
      
              {/* Destination Stop */}
              <div className="border p-4 rounded-lg">
                <h3 className="font-medium mb-3">Destination Stop</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stop Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={formData.route.destination_stop.name}
                      onChange={(e) => handleNestedChange('route', 'destination_stop', 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={formData.route.destination_stop.city}
                      onChange={(e) => handleNestedChange('route', 'destination_stop', 'city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="e.g., 13.0827"
                        step="0.000001"
                        onChange={(e) => {
                          const match = formData.route.destination_stop.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
                          const lng = match ? match[1] : 0;
                          handleLocationChange('destination', null, e.target.value, lng);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="e.g., 80.2707"
                        step="0.000001"
                        onChange={(e) => {
                          const match = formData.route.destination_stop.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
                          const lat = match ? match[2] : 0;
                          handleLocationChange('destination', null, lat, e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            {/* Route Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Total Distance (km)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.route.total_distance}
                  onChange={(e) => handleChange('route', 'total_distance', parseInt(e.target.value, 10))}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Duration (minutes)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.route.total_duration}
                  onChange={(e) => handleChange('route', 'total_duration', parseInt(e.target.value, 10))}
                  min="0"
                  required
                />
              </div>
            </div>
      
            {/* Intermediate Stops */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Intermediate Stops</h3>
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={addIntermediateStop}
                >
                  Add Stop
                </button>
              </div>
      
              {intermediateStops.map((stop, index) => (
                <div key={index} className="border p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-3">
                    <h4>Stop #{stop.sequence}</h4>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeStop(index)}
                    >
                      Remove
                    </button>
                  </div>
      
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Stop Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={stop.name}
                        onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={stop.city}
                        onChange={(e) => handleStopChange(index, 'city', e.target.value)}
                        required
                      />
                    </div>
                  </div>
      
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="e.g., 12.9816"
                        step="0.000001"
                        onChange={(e) => {
                          const match = stop.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
                          const lng = match ? match[1] : 0;
                          handleLocationChange('intermediate', index, e.target.value, lng);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded"
                        placeholder="e.g., 77.6047"
                        step="0.000001"
                        onChange={(e) => {
                          const match = stop.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
                          const lat = match ? match[2] : 0;
                          handleLocationChange('intermediate', index, lat, e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      
          {/* Schedule Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Schedule Information</h2>
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Valid From</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.schedule.valid_from}
                  onChange={(e) => handleChange('schedule', 'valid_from', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid Until (Optional)</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.schedule.valid_until}
                  onChange={(e) => handleChange('schedule', 'valid_until', e.target.value)}
                />
              </div>
            </div>
      
            {/* Journey Information */}
            <h3 className="font-medium mb-3">Journey Details</h3>
      
            <div className="border p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Departure Time</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded"
                    value={formData.schedule.journeys[0].departure_time}
                    onChange={(e) => handleJourneyChange(0, 'departure_time', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Arrival Time</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded"
                    value={formData.schedule.journeys[0].arrival_time}
                    onChange={(e) => handleJourneyChange(0, 'arrival_time', e.target.value)}
                    required
                  />
                </div>
              </div>
      
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Days of Week</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <label key={day} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={formData.schedule.journeys[0].days_of_week.includes(day)}
                        onChange={() => handleDayToggle(0, day)}
                      />
                      <span className="ml-2">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
      
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Add Bus Schedule'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}