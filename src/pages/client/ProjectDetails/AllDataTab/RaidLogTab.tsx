import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Flag, MessageSquare, Paperclip, Funnel } from 'lucide-react';
import RaidLogModel from './RaidLogModel';

interface ProjectItem {
  id: number;
  name: string;
  type: string;
  assignedStaff: string[];
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  level: 'High' | 'Medium' | 'Low';
  attachments: number;
  comments: number;
}

const RaidLogTab: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const itemsPerPage = 11;

  // Generate dummy data
  const allProjects: ProjectItem[] = useMemo(() => {
    const baseProjects = [
      { id: 1, name: 'Transit Authority - New Permitting Requirements', type: 'Change', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Low' as const, attachments: 0, comments: 0 },
      { id: 2, name: 'Lumber Supply Chain Disruption', type: 'Risk', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Medium' as const, attachments: 0, comments: 0 },
      { id: 3, name: 'Engineering Firm - New Requirements for Suspension', type: 'Assumption', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'High' as const, attachments: 0, comments: 0 },
      { id: 4, name: 'Steel Tariffs - Cost Overruns', type: 'Issue', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Medium' as const, attachments: 0, comments: 0 },
      { id: 5, name: 'Project Delays due to Steel Production Slowdowns', type: 'Assumption', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Low' as const, attachments: 4, comments: 4 },
      { id: 6, name: 'Water rights', type: 'Dependency', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Medium' as const, attachments: 8, comments: 8 },
      { id: 7, name: 'Roadway Blockages', type: 'Issue', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'High' as const, attachments: 2, comments: 2 },
      { id: 8, name: 'Call Trans Authority', type: 'Risk', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Medium' as const, attachments: 3, comments: 3 },
      { id: 9, name: 'Apples', type: 'Issue', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Low' as const, attachments: 5, comments: 5 },
      { id: 10, name: '2nd Floor Slab', type: 'Dependency', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Medium' as const, attachments: 7, comments: 7 },
      { id: 11, name: '1st Floor Slab', type: '1st Floor Slab', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Low' as const, attachments: 2, comments: 2 },
      { id: 12, name: '2nd Floor Slab', type: '2nd Floor Slab', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Medium' as const, attachments: 9, comments: 9 },
      { id: 13, name: '3rd Floor Slab', type: '3rd Floor Slab', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'Low' as const, attachments: 23, comments: 23 },
      { id: 14, name: 'Terrace Floor Slab', type: 'Terrace Floor Slab', assignedStaff: ['User1', 'User2', 'User3'], priority: 'High' as const, dueDate: '24-7-2024', level: 'High' as const, attachments: 2, comments: 2 },
    ];

    const additionalProjects = [];
    for (let i = 15; i <= 500; i++) {
      const template = baseProjects[i % baseProjects.length];
      additionalProjects.push({
        ...template,
        id: i,
        name: `${template.name} ${i}`,
      });
    }

    return [...baseProjects, ...additionalProjects];
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return allProjects;
    return allProjects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProjects, searchQuery]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const toggleItemSelection = (id: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const toggleAllItems = () => {
    if (selectedItems.size === paginatedProjects.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedProjects.map(p => p.id)));
    }
  };

  const handleView = (project: ProjectItem) => {
    alert(`Viewing: ${project.name}`);
  };

  const handleEdit = (project: ProjectItem) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = (project: ProjectItem) => {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      alert(`Deleted: ${project.name}`);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-orange-100 text-orange-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push('...');
      if (currentPage > 3 && currentPage < totalPages - 2) {
        pages.push(currentPage);
      }
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };


  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300 mb-10">
      <div className="border border-gray-200 dark:border-slate-800 p-6 rounded-lg mx-auto bg-white dark:bg-slate-900 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">All file</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search Project..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 text-sm bg-transparent dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 dark:text-slate-100"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
              <Funnel className="w-4 h-4" />
              Filter By
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedProjects.length && paginatedProjects.length > 0}
                    onChange={toggleAllItems}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-slate-400">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-slate-400">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-slate-400">Assign Staff</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-slate-400">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-slate-400">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-slate-400">Level</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  <Paperclip className="w-4 h-4 mx-auto" />
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  <MessageSquare className="w-4 h-4 mx-auto" />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(project.id)}
                      onChange={() => toggleItemSelection(project.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">{project.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">{project.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">A</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">B</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">C</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400">+8</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-red-600 dark:text-rose-400">
                      <Flag className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{project.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">{project.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(project.level)}`}>
                      {project.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-slate-400">
                      <Paperclip className="w-4 h-4" />
                      {project.attachments > 0 && <span className="text-sm">{project.attachments}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-slate-400">
                      <MessageSquare className="w-4 h-4" />
                      {project.comments > 0 && <span className="text-sm">{project.comments}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(project)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-sm text-gray-700 dark:text-slate-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of <span className="font-medium text-blue-600 dark:text-blue-400">{filteredProjects.length}</span> Files
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                      ? 'bg-blue-600 text-white'
                      : page === '...'
                        ? 'text-gray-400 dark:text-slate-600 cursor-default'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <RaidLogModel
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default RaidLogTab;