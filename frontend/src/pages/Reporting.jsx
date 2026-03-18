import React, { useState, useEffect } from 'react';
import { BarChart2, DollarSign, ShoppingBag, Users, ShoppingCart, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const Card = ({ children, className = "" }) => (
  <div className={`bg-surface rounded-2xl shadow-sm border border-muted/20 overflow-hidden ${className}`}>
    {children}
  </div>
);

export default function Reporting() {
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('overall_sales');
  const [dateRange, setDateRange] = useState('last7days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData(reportType, dateRange);
  }, [reportType, dateRange]);

  const fetchReportData = async (type, range) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin_reports.php?report_type=${type}&range=${range}`);
      const data = await response.json();
      setReportData(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const renderSalesTrend = () => {
    if (!reportData || !reportData.salesTrend || reportData.salesTrend.length === 0) {
      return <div className="py-20 text-center text-muted/70 italic">Insufficient data to generate trend.</div>;
    }
    const maxVal = Math.max(...reportData.salesTrend.map(d => d.revenue || 1));
    
    return (
      <Card className="p-8">
        <div className="flex justify-between items-center mb-10">
           <h4 className="text-sm font-bold uppercase tracking-widest text-muted/70">Revenue Stream</h4>
           <div className="flex items-center gap-2 text-success font-bold text-xs bg-success-soft px-2 py-1 rounded-lg">
             <TrendingUp size={14}/> +12.5% vs prev.
           </div>
        </div>
        <div className="flex items-end justify-between h-64 gap-2">
          {reportData.salesTrend.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(item.revenue / maxVal) * 100}%` }}
                className="w-full bg-accent rounded-t-lg group-hover:bg-accent-dark transition-all cursor-pointer relative"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-text-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  ₹{item.revenue.toLocaleString()}
                </div>
              </motion.div>
              <span className="text-[8px] font-bold text-muted/70 uppercase mt-4 rotate-45 origin-left">{item.label}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderSalesByProduct = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return <div className="py-20 text-center text-muted/70 italic">No product sales found for this period.</div>;
    }
    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted/70 uppercase tracking-widest bg-surface-100 border-b border-muted/20">
              <tr>
                <th className="py-5 px-8">Product Model</th>
                <th className="py-5 px-8 text-right">Volume</th>
                <th className="py-5 px-8 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/10">
              {reportData.map(item => (
                <tr key={item.id} className="hover:bg-surface-100/50 transition-colors">
                  <td className="py-5 px-8 font-bold text-text-700">{item.name}</td>
                  <td className="py-5 px-8 text-right font-medium text-muted/70">{item.total_quantity} units</td>
                  <td className="py-5 px-8 text-right font-bold text-accent">₹{parseFloat(item.total_revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };
  
  const renderTopCustomers = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      return <div className="py-20 text-center text-muted/70 italic">No customer activity found for this period.</div>;
    }
    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted/70 uppercase tracking-widest bg-surface-100 border-b border-muted/20">
              <tr>
                <th className="py-5 px-8">Client</th>
                <th className="py-5 px-8 text-right">Order Count</th>
                <th className="py-5 px-8 text-right">Total Lifetime Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/10">
              {reportData.map(item => (
                <tr key={item.id} className="hover:bg-surface-100/50 transition-colors">
                  <td className="py-5 px-8">
                    <div className="font-bold text-text-700">{item.name}</div>
                    <div className="text-[10px] font-bold text-muted/70 uppercase">{item.email}</div>
                  </td>
                  <td className="py-5 px-8 text-right font-medium text-muted/70">{item.total_orders}</td>
                  <td className="py-5 px-8 text-right font-bold text-success">₹{parseFloat(item.total_spent).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const renderOverview = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 group hover:border-accent-light transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted/70 uppercase tracking-widest">Gross Revenue</p>
              <h4 className="text-4xl font-bold text-text">₹{(reportData?.totalRevenue || 0).toLocaleString()}</h4>
            </div>
            <div className="p-4 bg-accent-light text-accent rounded-2xl group-hover:bg-accent group-hover:text-surface transition-all"><DollarSign size={24}/></div>
          </div>
        </Card>
        <Card className="p-8 group hover:border-success-light transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted/70 uppercase tracking-widest">Order Volume</p>
              <h4 className="text-4xl font-bold text-text">{(reportData?.totalOrders || 0).toLocaleString()}</h4>
            </div>
            <div className="p-4 bg-success-soft text-success rounded-2xl group-hover:bg-success group-hover:text-surface transition-all"><ShoppingBag size={24}/></div>
          </div>
        </Card>
        <Card className="p-8 group hover:border-warning-light transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-muted/70 uppercase tracking-widest">Avg. Ticket Size</p>
              <h4 className="text-4xl font-bold text-text">₹{(reportData?.averageOrderValue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
            </div>
            <div className="p-4 bg-warning-soft text-warning rounded-2xl group-hover:bg-warning group-hover:text-surface transition-all"><ShoppingCart size={24}/></div>
          </div>
        </Card>
      </div>
      {renderSalesTrend()}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted/70 text-sm font-medium mt-1 uppercase tracking-widest">Data Insights & Performance Metrics</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl shadow-sm border border-muted/20">
          {['today', 'last7days', 'last30days', 'alltime'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${dateRange === range ? 'bg-accent text-surface shadow-lg shadow-accent-light' : 'text-muted/70 hover:text-text'}`}
            >
              {range === 'today' ? '24H' : range === 'last7days' ? '7D' : range === 'last30days' ? '30D' : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-10 border-b border-muted/20">
        <button onClick={() => setReportType('overall_sales')} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${reportType === 'overall_sales' ? 'text-accent border-b-2 border-accent' : 'text-muted/70 hover:text-text'}`}>Overview</button>
        <button onClick={() => setReportType('sales_by_product')} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${reportType === 'sales_by_product' ? 'text-accent border-b-2 border-accent' : 'text-muted/70 hover:text-text'}`}>Inventory Performance</button>
        <button onClick={() => setReportType('top_customers')} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${reportType === 'top_customers' ? 'text-accent border-b-2 border-accent' : 'text-muted/70 hover:text-text'}`}>Customer Loyalty</button>
      </div>
      
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-muted/70 uppercase tracking-widest">Aggregating Data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={reportType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {reportType === 'sales_by_product' ? renderSalesByProduct() : reportType === 'top_customers' ? renderTopCustomers() : renderOverview()}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
