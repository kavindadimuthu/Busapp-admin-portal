import { useState } from 'react';
import Header from '../components/Header';

function Dashboard() {
  // Static data to be replaced with API calls later
  const [stats] = useState({
    totalRoutes: 142,
    activePermits: 87,
    pendingApprovals: 23,
    expiringSoon: 15
  });

  const [recentRoutes] = useState([
    { id: 1, routeNumber: "176", origin: "Colombo", destination: "Kandy", frequency: "Every 30 min", status: "Active" },
    { id: 2, routeNumber: "245", origin: "Galle", destination: "Matara", frequency: "Every 45 min", status: "Active" },
    { id: 3, routeNumber: "112", origin: "Negombo", destination: "Colombo", frequency: "Every 20 min", status: "Under Review" },
    { id: 4, routeNumber: "198", origin: "Colombo", destination: "Jaffna", frequency: "Twice Daily", status: "Active" }
  ]);

  const [recentPermits] = useState([
    { id: 1, operatorName: "Lanka Express", permitNumber: "SLTB-2023-0045", issueDate: "2023-01-15", expiryDate: "2024-01-14", status: "Active" },
    { id: 2, operatorName: "Southern Transport", permitNumber: "SLTB-2023-0102", issueDate: "2023-03-22", expiryDate: "2024-03-21", status: "Active" },
    { id: 3, operatorName: "Central Bus Company", permitNumber: "SLTB-2023-0078", issueDate: "2023-02-10", expiryDate: "2023-06-09", status: "Expiring Soon" },
    { id: 4, operatorName: "Northern Lines", permitNumber: "SLTB-2022-0189", issueDate: "2022-07-08", expiryDate: "2023-05-07", status: "Expired" }
  ]);

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Ministry of Transport - Bus Administration Portal</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Total Routes</h3>
            <p className="text-2xl font-bold">{stats.totalRoutes}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Active Permits</h3>
            <p className="text-2xl font-bold">{stats.activePermits}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Pending Approvals</h3>
            <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">Permits Expiring Soon</h3>
            <p className="text-2xl font-bold">{stats.expiringSoon}</p>
          </div>
        </div>
        
        {/* Recent Routes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Route Schedules</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View All Routes</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-3 px-4 text-left">Route No.</th>
                  <th className="py-3 px-4 text-left">Origin</th>
                  <th className="py-3 px-4 text-left">Destination</th>
                  <th className="py-3 px-4 text-left">Frequency</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentRoutes.map(route => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{route.routeNumber}</td>
                    <td className="py-3 px-4">{route.origin}</td>
                    <td className="py-3 px-4">{route.destination}</td>
                    <td className="py-3 px-4">{route.frequency}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        route.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        route.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                      }`}>
                        {route.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Permits */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Bus Permits</h2>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View All Permits</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-3 px-4 text-left">Operator</th>
                  <th className="py-3 px-4 text-left">Permit Number</th>
                  <th className="py-3 px-4 text-left">Issue Date</th>
                  <th className="py-3 px-4 text-left">Expiry Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPermits.map(permit => (
                  <tr key={permit.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{permit.operatorName}</td>
                    <td className="py-3 px-4">{permit.permitNumber}</td>
                    <td className="py-3 px-4">{permit.issueDate}</td>
                    <td className="py-3 px-4">{permit.expiryDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        permit.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        permit.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' :
                        permit.status === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                      }`}>
                        {permit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;