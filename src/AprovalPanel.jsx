import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from './Firebase';
import { Trash2 } from 'lucide-react';

const ApprovalPanel = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [stats, setStats] = useState({
    sellers: 0,
    buyers: 0,
    total: 0,
    pending: 0
  });

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const registrationsRef = collection(firestore, 'auctions');
      const querySnapshot = await getDocs(registrationsRef);
      
      const registrations = [];
      let sellers = 0;
      let buyers = 0;
      let pending = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (!data.isApproved) pending++;
        if (data.role === 'seller') sellers++;
        if (data.role === 'buyer') buyers++;
        
        let submitterDetails = { name: 'N/A', email: 'N/A' };
        if (data.submittedBy) {
          const userDoc = await getDoc(doc(firestore, 'users', data.submittedBy));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            submitterDetails = {
              name: userData.name || 'N/A',
              email: userData.email || 'N/A'
            };
          }
        }
        
        registrations.push({
          id: docSnapshot.id,
          ...data,
          submitterDetails
        });
      }

      setPendingRegistrations(registrations);
      setStats({
        sellers,
        buyers,
        total: sellers + buyers,
        pending
      });
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const handleApproval = async (registrationId, approved) => {
    try {
      const registrationRef = doc(firestore, 'auctions', registrationId);
      
      if (approved) {
        await updateDoc(registrationRef, {
          isApproved: true,
          approvedAt: new Date(),
        });
      } else {
        await deleteDoc(registrationRef);
      }
      
      if (!approved) {
        setPendingRegistrations(prev => 
          prev.filter(registration => registration.id !== registrationId)
        );
        
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          total: prev.total - 1,
          sellers: prev.sellers - (pendingRegistrations.find(r => r.id === registrationId)?.role === 'seller' ? 1 : 0),
          buyers: prev.buyers - (pendingRegistrations.find(r => r.id === registrationId)?.role === 'buyer' ? 1 : 0)
        }));
      } else {
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      alert("Error processing the registration. Please try again.");
    }
  };

  const handleDelete = async (registrationId) => {
    try {
      if (window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
        const registrationRef = doc(firestore, 'auctions', registrationId);
        await deleteDoc(registrationRef);
        
        setPendingRegistrations(prev => 
          prev.filter(registration => registration.id !== registrationId)
        );
        
        const deletedRegistration = pendingRegistrations.find(r => r.id === registrationId);
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          sellers: prev.sellers - (deletedRegistration?.role === 'seller' ? 1 : 0),
          buyers: prev.buyers - (deletedRegistration?.role === 'buyer' ? 1 : 0),
          pending: prev.pending - (!deletedRegistration?.isApproved ? 1 : 0)
        }));
      }
    } catch (error) {
      console.error("Error deleting registration:", error);
      alert("Error deleting the registration. Please try again.");
    }
  };

  return (
    <div className="flex h-screen min-w-[79rem]">
      <div className="flex-1 p-6 bg-white">
        <div className="flex gap-8 mb-8">
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Seller/Farmer</div>
            <div className="text-2xl font-bold">{stats.sellers}</div>
          </div>
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Buyer</div>
            <div className="text-2xl font-bold">{stats.buyers}</div>
          </div>
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="border p-4 rounded w-40">
            <div className="text-sm mb-2">Pending Approval</div>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Registrations</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="pb-3">Name</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">GST No</th>
                <th className="pb-3">License No</th>
                <th className="pb-3">Submitted By</th>
                <th className="pb-3">Submitter Email</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRegistrations.map((registration) => (
                <tr key={registration.id} className="border-b">
                  <td className="py-2">{registration.name}</td>
                  <td>{registration.role}</td>
                  <td>{registration.gst}</td>
                  <td>{registration.license}</td>
                  <td>{registration.submitterDetails.name}</td>
                  <td>{registration.submitterDetails.email}</td>
                  <td>
                    <span className={registration.isApproved ? "text-green-500" : "text-yellow-500"}>
                      {registration.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="flex gap-2 py-2">
                    {!registration.isApproved ? (
                      <>
                        <button 
                          onClick={() => handleApproval(registration.id, true)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to reject this registration? This action cannot be undone.')) {
                              handleApproval(registration.id, false)
                            }
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleDelete(registration.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete registration"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPanel;