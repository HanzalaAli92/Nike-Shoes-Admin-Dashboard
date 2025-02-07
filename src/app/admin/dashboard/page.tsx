"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Swal from "sweetalert2";
import ProtectedRoute from "../../components/ProtectedRoute";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          total,
          discount,
          orderDate,
          status,
          cartItems[]->{
            productName,
            image
          }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (newStatus === "dispatch") {
        Swal.fire("Dispatch", "The order is now dispatched.", "success");
      } else if (newStatus === "success") {
        Swal.fire("Success", "The order has been completed.", "success");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Something went wrong while updating the status.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gray-900 text-white">
  {/* Navbar */}
  <nav className="bg-gray-800 p-4 shadow-lg flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
    <h2 className="text-2xl font-bold text-red-500">Admin Dashboard</h2>
    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
      {["All", "pending", "dispatch", "success"].map((status) => (
        <button
          key={status}
          className={`px-3 py-2 text-sm md:text-base md:px-4 md:py-2 rounded-lg transition-all ${
            filter === status
              ? "bg-red-500 text-white font-bold"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setFilter(status)}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  </nav>

  {/* Orders Table */}
  <div className="flex-1 p-4 md:p-6 overflow-y-auto">
    <h2 className="text-2xl font-bold mb-4 text-center text-red-500">Orders</h2>
    <div className="overflow-x-auto bg-gray-800 shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-700 text-sm lg:text-base">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-2 py-2 md:px-4 md:py-3 text-left text-red-400">ID</th>
            <th className="px-2 py-2 md:px-4 md:py-3 text-left text-red-400">Customer</th>
            <th className="px-2 py-2 md:px-4 md:py-3 text-left text-red-400 hidden md:table-cell">
              Address
            </th>
            <th className="px-2 py-2 md:px-4 md:py-3 text-left text-red-400">Date</th>
            <th className="px-2 py-2 md:px-4 md:py-3 text-left text-red-400">Total</th>
            <th className="px-2 py-2 md:px-4 md:py-3 text-left text-red-400">Status</th>
            <th className="px-2 py-2 md:px-4 md:py-3 text-left text-red-400">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {filteredOrders.map((order) => (
            <React.Fragment key={order._id}>
              <tr
                className="cursor-pointer hover:bg-gray-750 transition-all"
                onClick={() => toggleOrderDetails(order._id)}
              >
                <td className="px-2 py-2 md:px-4 md:py-3">{order._id}</td>
                <td className="px-2 py-2 md:px-4 md:py-3">
                  {order.firstName} {order.lastName}
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3 hidden md:table-cell">
                  {order.address}
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3">${order.total}</td>
                <td className="px-2 py-2 md:px-4 md:py-3">
                  <select
                    value={order.status || ""}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600 transition"
                  >
                    <option value="pending">Pending</option>
                    <option value="dispatch">Dispatch</option>
                    <option value="success">Completed</option>
                  </select>
                </td>
                <td className="px-2 py-2 md:px-4 md:py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order._id);
                    }}
                    className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              {selectedOrderId === order._id && (
                <tr>
                  <td
                    colSpan={7}
                    className="bg-gray-750 p-4 transition-all animate-fadeIn"
                  >
                    <h3 className="font-bold text-red-400">Order Details</h3>
                    <p>
                      <strong>Phone:</strong> {order.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p>
                      <strong>City:</strong> {order.city}
                    </p>
                    <ul>
                      {order.cartItems.map((item, index) => (
                        <li
                          key={`${order._id}-${index}`}
                          className="flex items-center gap-2"
                        >
                          {item.productName}
                          {item.image && (
                            <Image
                              src={urlFor(item.image).url()}
                              width={40}
                              height={40}
                              alt={item.productName}
                              className="rounded"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
    </ProtectedRoute>
  );
}