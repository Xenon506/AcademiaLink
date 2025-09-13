import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  FolderOpen, 
  Upload, 
  Download, 
  FileText, 
  Video, 
  Image, 
  File, 
  Search,
  Filter,
  Plus,
  Eye,
  Clock,
  User
} from "lucide-react";

export default function Documents() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    courseId: "",
    isPublic: false
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    enabled: !!isAuthenticated,
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents', selectedCourse],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCourse) params.set('courseId', selectedCourse);
      return fetch(`/api/documents?${params}`).then(res => res.json());
    },
    enabled: !!isAuthenticated,
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadData({
        title: "",
        description: "",
        courseId: "",
        isPublic: false
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadData.title) {
      toast({
        title: "Error",
        description: "Please select a file and enter a title",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('courseId', uploadData.courseId);
    formData.append('isPublic', uploadData.isPublic.toString());

    uploadDocumentMutation.mutate(formData);
  };

  const handleDownload = (document: any) => {
    window.open(`/api/documents/${document.id}/download`, '_blank');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('video/')) return Video;
    if (mimeType?.startsWith('image/')) return Image;
    if (mimeType?.includes('pdf') || mimeType?.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter((doc: any) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground" data-testid="text-documents-title">
                  Document Repository
                </h1>
                <p className="text-sm text-muted-foreground">
                  Access course materials, upload documents, and manage versions
                </p>
              </div>
              <Button 
                onClick={() => setShowUploadDialog(true)}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-upload-document"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="search">Search Documents</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                          data-testid="input-search-documents"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="course-filter">Course</Label>
                      <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger data-testid="select-course-filter">
                          <SelectValue placeholder="All courses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All courses</SelectItem>
                          {courses.map((course: any) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.code} - {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-sm mb-3">File Types</h4>
                      <div className="space-y-2">
                        {[
                          { icon: FileText, label: "Documents", count: documents.filter((d: any) => d.mimeType?.includes('document') || d.mimeType?.includes('pdf')).length },
                          { icon: Video, label: "Videos", count: documents.filter((d: any) => d.mimeType?.startsWith('video/')).length },
                          { icon: Image, label: "Images", count: documents.filter((d: any) => d.mimeType?.startsWith('image/')).length },
                          { icon: File, label: "Other", count: documents.filter((d: any) => !d.mimeType?.startsWith('video/') && !d.mimeType?.startsWith('image/') && !d.mimeType?.includes('document') && !d.mimeType?.includes('pdf')).length }
                        ].map((type, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <type.icon className="w-4 h-4 text-muted-foreground" />
                              <span>{type.label}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {type.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documents Grid */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="grid" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TabsList data-testid="tabs-document-view">
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                      <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>
                    <Button variant="outline" size="sm" data-testid="button-filter-options">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
                  </div>

                  <TabsContent value="grid">
                    {documentsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <Card key={i} className="animate-pulse">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="h-12 bg-muted rounded"></div>
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : filteredDocuments.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm ? "Try adjusting your search terms" : "No documents have been uploaded yet"}
                          </p>
                          <Button onClick={() => setShowUploadDialog(true)} data-testid="button-upload-first-document">
                            Upload Document
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDocuments.map((document: any) => {
                          const FileIcon = getFileIcon(document.mimeType);
                          
                          return (
                            <Card key={document.id} className="hover:shadow-md transition-shadow group" data-testid={`document-${document.id}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3 mb-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileIcon className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-foreground truncate" data-testid="text-document-title">
                                      {document.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      {document.fileName}
                                    </p>
                                  </div>
                                </div>

                                {document.description && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid="text-document-description">
                                    {document.description}
                                  </p>
                                )}

                                <div className="space-y-2 text-xs text-muted-foreground">
                                  <div className="flex items-center justify-between">
                                    <span>Size: {formatFileSize(document.fileSize)}</span>
                                    <span>v{document.version}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <User className="w-3 h-3" />
                                    <span>Uploaded by {document.uploadedBy}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Download className="w-3 h-3" />
                                    <span>{document.downloadCount} downloads</span>
                                  </div>
                                </div>

                                <div className="flex space-x-2 mt-3">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => handleDownload(document)}
                                    data-testid="button-download-document"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    data-testid="button-view-document"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>

                                {document.isPublic && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    Public
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="list">
                    <Card>
                      <CardContent className="p-0">
                        {documentsLoading ? (
                          <div className="space-y-4 p-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div key={i} className="flex items-center space-x-4 animate-pulse">
                                <div className="w-8 h-8 bg-muted rounded"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-muted rounded w-1/3"></div>
                                  <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                                <div className="w-20 h-8 bg-muted rounded"></div>
                              </div>
                            ))}
                          </div>
                        ) : filteredDocuments.length === 0 ? (
                          <div className="p-8 text-center">
                            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
                            <p className="text-sm text-muted-foreground">
                              {searchTerm ? "Try adjusting your search terms" : "No documents have been uploaded yet"}
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {filteredDocuments.map((document: any) => {
                              const FileIcon = getFileIcon(document.mimeType);
                              
                              return (
                                <div key={document.id} className="p-4 hover:bg-secondary/50 transition-colors" data-testid={`document-list-${document.id}`}>
                                  <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                      <FileIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-foreground" data-testid="text-document-list-title">
                                        {document.title}
                                      </h4>
                                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span>{document.fileName}</span>
                                        <span>{formatFileSize(document.fileSize)}</span>
                                        <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        v{document.version}
                                      </Badge>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleDownload(document)}
                                        data-testid="button-download-document-list"
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Select File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  data-testid="input-upload-file"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Document Title *</Label>
                <Input
                  id="title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                  required
                  data-testid="input-document-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Document description"
                  rows={3}
                  data-testid="textarea-document-description"
                />
              </div>

              <div>
                <Label htmlFor="course">Course</Label>
                <Select 
                  value={uploadData.courseId} 
                  onValueChange={(value) => setUploadData(prev => ({ ...prev, courseId: value }))}
                >
                  <SelectTrigger data-testid="select-document-course">
                    <SelectValue placeholder="Select a course (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific course</SelectItem>
                    {courses.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={uploadData.isPublic}
                  onCheckedChange={(checked) => setUploadData(prev => ({ ...prev, isPublic: checked }))}
                  data-testid="switch-document-public"
                />
                <Label htmlFor="isPublic">Make document public</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowUploadDialog(false)}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={uploadDocumentMutation.isPending}
                  data-testid="button-upload-submit"
                >
                  {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
