import React, { useState } from 'react';
import { X, Info, Plus, Smile, Paperclip, Send } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  date: string;
  url: string;
}

interface AssignedUser {
  id: string;
  name: string;
  avatar: string;
}

interface RaidLogModelProps {
  open: boolean;
  onClose: () => void;
  project: any;
}

const RaidLogModel: React.FC<RaidLogModelProps> = ({ open, onClose, project }) => {
  const [raidId] = useState('#C-35');
  const [assumption, setAssumption] = useState('Assumption');
  const [status, setStatus] = useState('Opened');
  const [priority, setPriority] = useState('Critical');
  const [selectedDate, setSelectedDate] = useState('July 10');
  const [isOpen, _setIsOpen] = useState(true);

  const [description, setDescription] = useState(
    "Hello Support Team,\n\nI'm trying to export our analytics data to CSV format but keep getting an error message. When I click on the \"Export to CSV\" button in the Reports section, the loading spinner appears for about 10 seconds and then displays \"Export Failed: Unknown Error\". I've tried this on multiple browsers (Chrome, Firefox, and Edge) with the same result"
  );

  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Material Delivery' },
    { id: '2', name: 'Schedule Delay' }
  ]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const [assignedUsers, _setAssignedUsers] = useState<AssignedUser[]>([
    { id: '1', name: 'Jennifer Jones', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: '2', name: 'Mike Smith', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
    { id: '3', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    { id: '4', name: 'David Lee', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    { id: '5', name: 'Emily Brown', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
    { id: '6', name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
    { id: '7', name: 'Linda Davis', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
    { id: '8', name: 'Robert Taylor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { id: '9', name: 'Maria Garcia', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop' },
    { id: '10', name: 'John Anderson', avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=100&h=100&fit=crop' },
    { id: '11', name: 'Lisa Martinez', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop' }
  ]);

  const [newComment, setNewComment] = useState('');
  const [impact, setImpact] = useState('low');
  const [likelihood, setLikelihood] = useState('low');

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Jennifer Jones',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      time: 'Today, 10:43 AM',
      text: "I'm trying to export our analytics data to CSV format but keep getting an error message. When I click on the \"Export to CSV\" button in the Reports section, the loading spinner appears for about 10 seconds."
    },
    {
      id: '2',
      author: 'Mike Smith',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      time: 'Today, 10:43 AM',
      text: "I'm trying to export our analytics data to CSV format but keep getting an error message. When I click on the \"Export to CSV\" button in the Reports section, the loading spinner appears for about 10 seconds."
    }
  ]);

  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: '1',
      name: 'Business Analytics.png',
      size: '4 MB',
      date: '23 Jul',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop'
    }
  ]);

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagInput.trim()
      };
      setTags([...tags, newTag]);
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        time: new Date().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }),
        text: newComment
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        url: URL.createObjectURL(file)
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  const displayedUsers = assignedUsers.slice(0, 3);
  const remainingCount = assignedUsers.length - 3;

  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center mb-10 z-50 transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-[100rem] max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Transit Authority - New Permitting Requirements
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Information */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-300 dark:border-slate-800">
            <div className='flex justify-between'>
              {/* Raid Info Bar */}
              <div className="flex items-center gap-4  flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Raid ID:</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-200">{raidId}</span>
                </div>

                <select
                  value={assumption}
                  onChange={(e) => setAssumption(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-slate-800 rounded-full text-sm bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option>Assumption</option>
                  <option>Confirmed</option>
                  <option>Rejected</option>
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-slate-800 rounded-full text-sm bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option>Opened</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="px-3 py-1.5  border border-gray-300 dark:border-rose-500/20 rounded-full bg-red-50 dark:bg-rose-500/10 text-sm text-red-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-slate-800 rounded-full text-sm bg-transparent dark:bg-slate-900 text-gray-900 dark:text-slate-200 cursor-pointer"
                />
              </div>

              {/* Assigned To */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Assigned to:</span>
                </div>
                <div className="flex items-center">
                  {displayedUsers.map((user, _idx) => (
                    <img
                      key={user.id}
                      src={user.avatar}
                      alt={user.name}
                      title={user.name}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 -ml-2 first:ml-0 cursor-pointer hover:z-10 transition-transform hover:scale-110"
                    />
                  ))}
                  {remainingCount > 0 && (
                    <div
                      className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-white dark:border-slate-900 -ml-2 flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title={`${remainingCount} more users`}
                    >
                      +{remainingCount}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm mb-2">
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-600 dark:text-slate-400">Tags:</span>
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-md text-sm flex items-center gap-2 text-gray-900 dark:text-slate-200"
                  >
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}

                {showTagInput ? (
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
                    onBlur={handleAddTag}
                    placeholder="Enter tag name"
                    autoFocus
                    className="px-3 py-1 border border-gray-300 dark:border-slate-700 rounded-md text-sm bg-transparent dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="px-3 py-1 text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer"
                  >
                    Add More <Plus size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-900">DESCRIPTION</span>
                <Info size={16} className="text-gray-400" />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-slate-800 rounded-lg text-sm text-gray-700 dark:text-slate-300 bg-transparent dark:bg-slate-900 resize-none focus:outline-none"
                rows={6}
              />
            </div>

            {/* Risk Assessment */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Risk Assessment</span>
                <Info size={16} className="text-gray-400 dark:text-slate-500" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Impact */}
                <div>
                  <div className="text-sm text-gray-600 mb-3">Impact</div>
                  <div className="flex gap-4">
                    {['low', 'medium', 'high'].map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="impact"
                          value={level}
                          checked={impact === level}
                          onChange={(e) => setImpact(e.target.value)}
                          className="w-4 h-4 text-blue-600 dark:text-blue-500 cursor-pointer bg-transparent border-gray-300 dark:border-slate-700"
                        />
                        <span className="text-sm capitalize text-gray-700 dark:text-slate-300">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Likelihood */}
                <div>
                  <div className="text-sm text-gray-600 mb-3">Likelihood</div>
                  <div className="flex gap-4">
                    {['low', 'medium', 'high'].map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="likelihood"
                          value={level}
                          checked={likelihood === level}
                          onChange={(e) => setLikelihood(e.target.value)}
                          className="w-4 h-4 text-blue-600 dark:text-blue-500 cursor-pointer bg-transparent border-gray-300 dark:border-slate-700"
                        />
                        <span className="text-sm capitalize text-gray-700 dark:text-slate-300">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Attachment</span>
                <Info size={16} className="text-gray-400 dark:text-slate-500" />
              </div>
              <div className="flex gap-4 flex-wrap">
                {/* Existing Attachments */}
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="w-40 h-40 border border-gray-300 dark:border-slate-800 rounded-lg overflow-hidden relative group">
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-100 dark:bg-slate-800 p-2 text-xs">
                      <div className="font-medium truncate text-gray-900 dark:text-slate-100" title={attachment.name}>{attachment.name}</div>
                      <div className="text-gray-500 dark:text-slate-400">{attachment.date}, {attachment.size}</div>
                    </div>
                  </div>
                ))}

                {/* Upload Area */}
                <label className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Plus size={32} className="text-gray-400 dark:text-slate-600 mb-2" />
                  <div className="text-xs text-gray-600 dark:text-slate-400 text-center px-2">
                    Drag & drop or<br />browse
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Side - Comments */}
          <div className="w-[440px] flex flex-col bg-gray-50 dark:bg-slate-900">
            {/* Comments Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-gray-300 dark:border-slate-800">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">Comments</h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 animate-fadeIn">
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-slate-200">{comment.author}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-500">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-400 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-300 dark:border-slate-800">
              <div className="flex gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                  alt="Current user"
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handlePostComment)}
                    placeholder="Add Comment"
                    className="w-full p-3 border border-gray-300 dark:border-slate-800 rounded-lg text-sm bg-transparent dark:bg-slate-900 text-gray-900 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer">
                        <Paperclip size={18} className="text-gray-500 dark:text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer">
                        <Smile size={18} className="text-gray-500 dark:text-slate-400" />
                      </button>
                    </div>
                    <button
                      onClick={handlePostComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      Post Comment
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaidLogModel;