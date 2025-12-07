import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { Transaction, BatchSummary } from '../types';
import { TrendingUp, TrendingDown, DollarSign, BookOpen, Home, Briefcase, HeartPulse, Lightbulb } from 'lucide-react';

interface StatsChartProps {
  transactions: Transaction[];
  summary: BatchSummary;
}

const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#3B82F6'];

const StatsChart: React.FC<StatsChartProps> = ({ transactions, summary }) => {
  if (transactions.length === 0) return null;

  // --- Data Processing ---

  // 1. Category Data
  const categoryData = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.amountInUSD >= 0) return acc; // Skip income
      const category = curr.category || 'Uncategorized';
      const absAmount = Math.abs(curr.amountInUSD);
      const existing = acc.find(item => item.name === category);
      if (existing) existing.value += absAmount;
      else acc.push({ name: category, value: absAmount });
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  }, [transactions]);

  // 2. Monthly Trend Data (Income vs Expense)
  const monthlyData = useMemo(() => {
    const data: Record<string, { name: string, income: number, expense: number, dateObj: Date }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      // Fallback for invalid dates
      if (isNaN(date.getTime())) return;
      
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const name = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!data[key]) data[key] = { name, income: 0, expense: 0, dateObj: date };
      
      if (t.amountInUSD > 0) data[key].income += t.amountInUSD;
      else data[key].expense += Math.abs(t.amountInUSD);
    });

    return Object.values(data).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [transactions]);

  // 3. Insight Engine
  const insights = useMemo(() => {
    const totalExpense = Math.abs(summary.totalDebitsUSD);
    if (totalExpense === 0) return [];

    const tips = [];
    const topCategory = categoryData[0]?.name?.toLowerCase() || '';

    // Student Persona
    if (topCategory.includes('education') || topCategory.includes('dining') || topCategory.includes('tech')) {
        tips.push({
            type: 'Student Focus',
            icon: BookOpen,
            text: "Education & Tech are high. Consider student discounts on software and bulk-buying meal plans to save on dining.",
            color: "text-blue-600 bg-blue-50"
        });
    }

    // Family Persona
    if (topCategory.includes('groceries') || topCategory.includes('utilities') || topCategory.includes('rent')) {
        tips.push({
            type: 'Family Budget',
            icon: Home,
            text: "High household costs detected. Review utility providers for better rates and track grocery patterns to reduce waste.",
            color: "text-green-600 bg-green-50"
        });
    }

    // Elder/Medical Persona
    if (topCategory.includes('medical') || topCategory.includes('health')) {
        tips.push({
            type: 'Healthcare',
            icon: HeartPulse,
            text: "Medical expenses are significant. Check insurance coverage gaps and generic prescription alternatives.",
            color: "text-red-600 bg-red-50"
        });
    }
    
    // Employee/General
    if (tips.length === 0) {
        tips.push({
            type: 'Smart Savings',
            icon: Briefcase,
            text: `Your top expense is ${categoryData[0]?.name}. A 10% reduction here saves $${(categoryData[0]?.value * 0.1).toFixed(0)} monthly.`,
            color: "text-indigo-600 bg-indigo-50"
        });
    }
    
    // Savings Rate Tip
    const savingsRate = summary.totalCreditsUSD > 0 
        ? ((summary.totalCreditsUSD - Math.abs(summary.totalDebitsUSD)) / summary.totalCreditsUSD) * 100 
        : 0;

    if (savingsRate > 20) {
        tips.push({ type: 'Great Job', icon: TrendingUp, text: `You're saving ${savingsRate.toFixed(1)}% of your income! Consider investing the surplus.`, color: "text-emerald-600 bg-emerald-50" });
    } else if (savingsRate < 0) {
        tips.push({ type: 'Alert', icon: TrendingDown, text: "You are spending more than you earn. Review discretionary spending immediately.", color: "text-orange-600 bg-orange-50" });
    }

    return tips;
  }, [categoryData, summary]);

  return (
    <div className="space-y-8 mb-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24 text-green-600" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Income</p>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-extrabold text-slate-900">${summary.totalCreditsUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="ml-2 text-sm font-bold text-slate-400">USD</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-24 h-24 text-red-600" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Expenses</p>
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-extrabold text-slate-900">${Math.abs(summary.totalDebitsUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="ml-2 text-sm font-bold text-slate-400">USD</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-24 h-24 text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Net Balance</p>
          <div className="flex items-baseline mt-2">
            <span className={`text-3xl font-extrabold ${summary.netFlowUSD >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
              {summary.netFlowUSD >= 0 ? '+' : '-'}${Math.abs(summary.netFlowUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-2 text-sm font-bold text-slate-400">USD</span>
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border border-slate-100 flex items-start gap-4 shadow-sm ${insight.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-10 ')}`}>
                <div className={`p-3 rounded-xl ${insight.color} bg-white bg-opacity-80`}>
                    <insight.icon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 mb-1">{insight.type}</h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{insight.text}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spending Breakdown */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
             <span>Spending Habits</span>
          </h3>
          {categoryData.length > 0 ? (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value: number) => `$${value.toFixed(2)}`}
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 w-full max-w-sm">
                 {categoryData.map((entry, index) => (
                   <div key={index} className="flex items-center justify-between text-sm">
                     <div className="flex items-center text-slate-600 font-semibold">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="truncate max-w-[100px]">{entry.name}</span>
                     </div>
                     <span className="font-bold text-slate-900">${entry.value.toFixed(0)}</span>
                   </div>
                 ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 min-h-[250px] italic">
              No expense data available
            </div>
          )}
        </div>

        {/* Monthly/Timeline Analysis */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Financial Timeline</h3>
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
                {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                            <CartesianGrid vertical={false} stroke="#f1f5f9" />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`]}
                            />
                            <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-slate-400 italic">Add more dated transactions to see trends</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default StatsChart;