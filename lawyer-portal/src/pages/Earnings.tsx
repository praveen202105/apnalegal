import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { IndianRupee, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { lawyerApi } from '../api';

export default function Earnings() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lawyerApi.getEarnings()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
    );
  }

  const stats = [
    { label: 'Total Earned', value: `₹${data.totalEarned}`, icon: <IndianRupee />, color: '#002B5B' },
    { label: 'Cases Completed', value: data.totalCases, icon: <CheckCircle />, color: '#4CAF50' },
    { label: 'Avg per Case', value: `₹${data.totalCases > 0 ? Math.round(data.totalEarned / data.totalCases) : 0}`, icon: <TrendingUp />, color: '#FFD369' },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Earnings Overview</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={4} key={i}>
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

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Transaction History</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F4F7F6' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Case Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Fee</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Commission (Paid)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Net Earning</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.cases.map((c: any, i: number) => (
              <TableRow key={i}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={14} color="#757575" />
                    <Typography variant="body2">{new Date(c.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{c.legalCategory}</TableCell>
                <TableCell>₹{c.lawyerFee}</TableCell>
                <TableCell sx={{ color: 'error.main' }}>- ₹{c.commissionAmount}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>₹{c.lawyerFee - c.commissionAmount}</TableCell>
              </TableRow>
            ))}
            {data.cases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" color="text.secondary">No earnings recorded yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
