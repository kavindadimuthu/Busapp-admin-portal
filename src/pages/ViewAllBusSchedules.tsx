import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Header from '../components/Header.jsx'

interface Stop {
  id: string;
  route_stop_id: string;
  name: string;
  city: string;
  location: string;
  sequence: number;
}

interface StopTime {
  id: string;
  route_stop_id: string;
  arrival_time: string | null;
  departure_time: string | null;
}

interface Journey {
  id: string;
  departure_time: string;
  arrival_time: string;
  days_of_week: string[];
  stop_times: StopTime[] | null;
}

interface Schedule {
  schedule_id: string;
  valid_from: string;
  valid_until: string | null;
  bus_id: string;
  bus_number: string;
  bus_name: string;
  bus_type: string;
  fare: string;
  is_active: boolean;
  operator_id: string;
  operator_name: string;
  contact_info: string;
  route_id: string;
  route_name: string;
  total_distance: number;
  total_duration: number;
  stops: Stop[];
  journeys: Journey[];
}

interface ScheduleResponse {
  total: number;
  limit: number;
  offset: number;
  schedules: Schedule[];
}

export default function ViewAllBusSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchSchedules();
  }, [currentPage, limit]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const response = await axios.get<ScheduleResponse>('http://localhost:5000/schedule', {
        params: { limit, offset }
      });
      console.log('Fetched schedules:', response.data);
      
      setSchedules(response.data.schedules);
      setTotalRecords(response.data.total);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch schedules. Please try again later.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleViewStops = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No Expiry';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // Show only HH:MM
  };

  const totalPages = Math.ceil(totalRecords / limit);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDaysOfWeek = (days: string[]) => {
    if (!days || days.length === 0) return '-';
    if (days.length === 7) return 'Daily';
    return days.join(', ');
  };

  return (
    <>
      <Header />
      {/* Main content area */}
      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bus Schedules</h1>
      
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source/Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journey Times</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intermediate Stops</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((schedule) => (
                    <tr key={schedule.schedule_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{schedule.route_name}</div>
                        <div className="text-xs text-gray-500">
                          {schedule.total_distance} km • {schedule.total_duration} mins
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{schedule.bus_name}</div>
                        <div className="text-xs text-gray-500">
                          {schedule.bus_number} • {schedule.bus_type}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fare: Rs. {schedule.fare}
                        </div>
                        <div className={`text-xs ${schedule.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {schedule.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{schedule.operator_name}</div>
                        <div className="text-xs text-gray-500">{schedule.contact_info}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {schedule.stops && schedule.stops.length > 0 ? (
                          <>
                            <div className="text-sm text-gray-900">{schedule.stops[0]?.name}</div>
                            <div className="text-sm text-gray-500">↓</div>
                            <div className="text-sm text-gray-900">{schedule.stops[schedule.stops.length - 1]?.name}</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">No stops data</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">From: {formatDate(schedule.valid_from)}</div>
                        <div className="text-sm text-gray-900">Until: {formatDate(schedule.valid_until)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {schedule.journeys && schedule.journeys.length > 0 ? (
                          schedule.journeys.map((journey, idx) => (
                            <div key={journey.id} className={idx > 0 ? "mt-2 pt-2 border-t border-gray-200" : ""}>
                              <div className="text-sm text-gray-900">
                                {formatTime(journey.departure_time)} - {formatTime(journey.arrival_time)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDaysOfWeek(journey.days_of_week)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No journey data</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewStops(schedule)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Stops
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * limit, totalRecords)}
                </span>{" "}
                of <span className="font-medium">{totalRecords}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        {/* Sidebar for displaying stops */}
        {showSidebar && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40">
            <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Route Details</h2>
                  <button
                    onClick={closeSidebar}
                    className="bg-red-500 rounded-xl w-4 h-4 hover:text-gray-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentStroke">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{selectedSchedule.route_name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedSchedule.total_distance} km • Approximately {selectedSchedule.total_duration} minutes
                  </p>
                  <p className="text-sm font-medium mt-2">
                    {selectedSchedule.bus_name} ({selectedSchedule.bus_number})
                  </p>
                </div>
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-2">Journey Times</h4>
                  {selectedSchedule.journeys.map(journey => (
                    <div key={journey.id} className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">
                        {formatTime(journey.departure_time)} - {formatTime(journey.arrival_time)}
                      </p>
                      <p className="text-sm text-gray-600">{formatDaysOfWeek(journey.days_of_week)}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-2">Stops & Timing</h4>
                  <div className="space-y-1">
                    {selectedSchedule.stops.map((stop, index) => {
                      // Find matching stop times from the first journey
                      const journey = selectedSchedule.journeys[0];
                      // const stopTime = journey?.stop_times?.find(
                      //   st => selectedSchedule.stops.some(
                      //     // s => s.id === stop.id && s.sequence === stop.sequence
                      //     s => s.route_stop_id === stop.route_stop_id && s.sequence === stop.sequence
                      //   )
                      // );
                      const stopTime = journey?.stop_times?.find(
                        st => st.route_stop_id === stop.route_stop_id
                      );
                      console.log('Stop selected:', stop);
                      console.log('Stop Time:', stopTime);
                      // const stopTime = journey?.stop_times?.find(
                      //   st => st.route_stop_id === stop.id && selectedSchedule.stops.some(
                      //     s => s.id === stop.id && s.sequence === stop.sequence
                      //   )
                      // );
      
                      return (
                        <div key={stop.id} className="flex items-start p-3 border-l-2 border-blue-500">
                          <div className="flex flex-col items-center mr-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              {index + 1}
                            </div>
                            {index < selectedSchedule.stops.length - 1 && (
                              <div className="h-10 w-0.5 bg-blue-300"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{stop.name}</p>
                            <p className="text-sm text-gray-600">{stop.city}</p>
                            {stopTime && (
                              <div className="mt-1 text-sm">
                                {stopTime.arrival_time && (
                                  <p>Arrival: {formatTime(stopTime.arrival_time)}</p>
                                )}
                                {stopTime.departure_time && (
                                  <p>Departure: {formatTime(stopTime.departure_time)}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}