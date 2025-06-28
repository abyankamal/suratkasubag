import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Search from '@/components/Search';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Sample data for demonstration
const sampleData = [
  { id: 1, name: 'Surat Keputusan', category: 'Keputusan', date: '2025-06-20' },
  { id: 2, name: 'Surat Undangan Rapat', category: 'Undangan', date: '2025-06-21' },
  { id: 3, name: 'Surat Permohonan Dana', category: 'Permohonan', date: '2025-06-22' },
  { id: 4, name: 'Surat Keterangan Kerja', category: 'Keterangan', date: '2025-06-23' },
  { id: 5, name: 'Surat Perintah Tugas', category: 'Perintah', date: '2025-06-24' },
  { id: 6, name: 'Surat Edaran Libur', category: 'Edaran', date: '2025-06-25' },
  { id: 7, name: 'Surat Pemberitahuan Acara', category: 'Pemberitahuan', date: '2025-06-26' },
  { id: 8, name: 'Surat Rekomendasi Pegawai', category: 'Rekomendasi', date: '2025-06-27' },
  { id: 9, name: 'Surat Pengantar Dokumen', category: 'Pengantar', date: '2025-06-28' },
  { id: 10, name: 'Surat Pernyataan Komitmen', category: 'Pernyataan', date: '2025-06-29' },
];

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface PageProps extends Record<string, any> {
  auth: {
    user: User | null;
  };
}

const SearchDemo: React.FC = () => {
  const { auth } = usePage<PageProps>().props;
  // State for basic search
  const [basicSearchValue, setBasicSearchValue] = useState('');
  const [basicFilteredData, setBasicFilteredData] = useState(sampleData);
  
  // State for advanced search
  const [advancedSearchValue, setAdvancedSearchValue] = useState('');
  const [advancedFilteredData, setAdvancedFilteredData] = useState(sampleData);
  
  // State for category filter
  const [categorySearchValue, setCategorySearchValue] = useState('');
  const [categoryFilteredData, setCategoryFilteredData] = useState(sampleData);

  // Handle basic search
  useEffect(() => {
    if (basicSearchValue.trim() === '') {
      setBasicFilteredData(sampleData);
    } else {
      const searchTerm = basicSearchValue.toLowerCase().trim();
      const filtered = sampleData.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
      );
      setBasicFilteredData(filtered);
    }
  }, [basicSearchValue]);

  // Handle advanced search with minimum characters
  useEffect(() => {
    if (advancedSearchValue.trim() === '') {
      setAdvancedFilteredData(sampleData);
    } else if (advancedSearchValue.trim().length >= 3) {
      const searchTerm = advancedSearchValue.toLowerCase().trim();
      const filtered = sampleData.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.category.toLowerCase().includes(searchTerm)
      );
      setAdvancedFilteredData(filtered);
    }
  }, [advancedSearchValue]);

  // Handle category search
  useEffect(() => {
    if (categorySearchValue.trim() === '') {
      setCategoryFilteredData(sampleData);
    } else {
      const searchTerm = categorySearchValue.toLowerCase().trim();
      const filtered = sampleData.filter(item => 
        item.category.toLowerCase().includes(searchTerm)
      );
      setCategoryFilteredData(filtered);
    }
  }, [categorySearchValue]);

  return (
    <AppLayout auth={auth}>
      <Head title="Search Component Demo" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">Search Component Demo</h1>
          
          {/* Basic Search Example */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Basic Search</CardTitle>
              <CardDescription>
                Simple search that filters data as you type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 max-w-sm">
                <Search 
                  placeholder="Search by name..." 
                  onSearch={setBasicSearchValue}
                  autoFocus
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {basicFilteredData.length > 0 ? (
                    basicFilteredData.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Advanced Search Example */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Search with minimum 3 characters across multiple fields (name and category)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 max-w-sm">
                <Search 
                  placeholder="Search by name or category..." 
                  onSearch={setAdvancedSearchValue}
                  minChars={3}
                  debounceTime={500}
                />
                {advancedSearchValue.trim().length > 0 && advancedSearchValue.trim().length < 3 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Please enter at least 3 characters to search
                  </p>
                )}
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advancedFilteredData.length > 0 ? (
                    advancedFilteredData.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Category Filter Example */}
          <Card>
            <CardHeader>
              <CardTitle>Category Filter</CardTitle>
              <CardDescription>
                Search specifically by category with badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 max-w-sm">
                <Search 
                  placeholder="Filter by category..." 
                  onSearch={setCategorySearchValue}
                />
              </div>
              
              <div className="mb-4 flex flex-wrap gap-2">
                {Array.from(new Set(sampleData.map(item => item.category))).map(category => (
                  <Badge 
                    key={category} 
                    variant={categorySearchValue.toLowerCase() === category.toLowerCase() ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCategorySearchValue(category)}
                  >
                    {category}
                  </Badge>
                ))}
                {categorySearchValue && (
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setCategorySearchValue('')}
                  >
                    Clear Filter
                  </Badge>
                )}
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryFilteredData.length > 0 ? (
                    categoryFilteredData.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SearchDemo;
