import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { 
  ClipboardCheck, 
  TrendingUp, 
  AlertCircle,
  IndianRupee 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { adminApi } from '../api';

export default function DashboardOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false)); 
  }, []);

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    { label: 'Total Requests', value: data.requests.total, icon: <ClipboardCheck />, color: '#1565C0' },
    { label: 'Pending Review', value: data.requests.submitted, icon: <AlertCircle />, color: '#F57C00' },
    { label: 'Active Cases', value: data.requests.assigned, icon: <TrendingUp />, color: '#00897B' },
    { label: 'Total Revenue', value: `₹${data.totalCommission}`, icon: <IndianRupee />, color: '#6A1B9A' },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Overview</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${stat.color}15`, color: stat.color, display: 'flex' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, p: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Monthly Revenue Trend</Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#1565C0" strokeWidth={3} dot={{ r: 4, fill: '#1565C0' }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, p: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Request Status</Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'New', count: data.requests.submitted },
                  { name: 'Active', count: data.requests.assigned },
                  { name: 'Closed', count: data.requests.closed },
                  { name: 'Cancelled', count: data.requests.cancelled },
                ]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Top Performing Lawyers</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8F9FA' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Lawyer Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Specialties</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Cases</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Earnings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.topLawyers.map((lawyer: any) => (
              <TableRow key={lawyer._id}>
                <TableCell sx={{ fontWeight: 600 }}>{lawyer.name}</TableCell>
                <TableCell>{lawyer.city}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {lawyer.specialties.slice(0, 2).map((s: string) => (
                      <Chip key={s} label={s} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{lawyer.totalCases}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 700 }}>{lawyer.rating}</Typography>
                    <Box component="span" sx={{ color: '#FFB400' }}>★</Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>₹{lawyer.totalEarnings}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
