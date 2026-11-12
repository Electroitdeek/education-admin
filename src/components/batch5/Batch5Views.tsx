'use client';

import React from 'react';
import ErpCrudView, { FieldDef, ColumnDef } from '@/components/shared/ErpCrudView';

export const BATCH5_VIEW_IDS = [
  // 1. Front CMS (12)
  'cms-events',
  'cms-sections',
  'cms-gallery',
  'cms-notice',
  'cms-media',
  'cms-pages',
  'cms-menus',
  'cms-counter',
  'cms-banner',
  'cms-testimonials',
  'cms-blogs',
  'cms-courses',
  // 2. Subscription (1)
  'sub-installment-report',
  // 3. System Setting — Key-Value Entries (11)
  'set-general',
  'set-meta-data',
  'set-session',
  'set-institute-times',
  'set-referral',
  'set-communication',
  'set-biometric',
  'set-payment',
  'set-firebase',
  'set-front-cms',
  'set-configurations',
  // 3. System Setting — Master Records (13)
  'set-custom-columns',
  'set-document-master',
  'set-language',
  'set-template',
  'set-staff-slots',
  'set-student-delete',
  'set-remove-session',
  'set-roles',
  'set-backup',
  'set-disabled-status',
  'set-users',
  'set-student-privilege',
  'set-staff-privilege',
] as const;

export type Batch5ViewId = (typeof BATCH5_VIEW_IDS)[number];

function StatusBadge({ value }: { value?: string }) {
  const v = String(value || 'Pending');
  const lower = v.toLowerCase();
  let cls = 'bg-amber-50 text-amber-700 border-amber-200';
  if (['active', 'paid', 'published', 'completed', 'approved'].includes(lower)) {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['overdue', 'cancelled', 'inactive', 'failed', 'rejected'].includes(lower)) {
    cls = 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {v}
    </span>
  );
}

function ActiveBadge({ value }: { value?: boolean }) {
  const active = value !== false;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
        active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

const SETTING_ENTRY_CATEGORIES: Record<string, { title: string; category: string }> = {
  'set-general': { title: 'General Setting', category: 'General Setting' },
  'set-meta-data': { title: 'Meta Data', category: 'Meta Data' },
  'set-session': { title: 'Session Setting', category: 'Session Setting' },
  'set-institute-times': { title: 'Institute Times', category: 'Institute Times' },
  'set-referral': { title: 'Referral Setting', category: 'Referral Setting' },
  'set-communication': { title: 'Communication Setting', category: 'Communication Setting' },
  'set-biometric': { title: 'Biometric Setup', category: 'Biometric Setup' },
  'set-payment': { title: 'Payment Setting', category: 'Payment Setting' },
  'set-firebase': { title: 'Firebase Details', category: 'Firebase Details' },
  'set-front-cms': { title: 'Front CMS Setting', category: 'Front CMS Setting' },
  'set-configurations': { title: 'Configurations', category: 'Configurations' },
};

const SETTING_RECORD_TYPES: Record<string, { title: string; recordType: string }> = {
  'set-custom-columns': { title: 'Custom Columns', recordType: 'Custom Columns' },
  'set-document-master': { title: 'Document Master', recordType: 'Document Master' },
  'set-language': { title: 'Language', recordType: 'Language' },
  'set-template': { title: 'Template Setting', recordType: 'Template Setting' },
  'set-staff-slots': { title: 'Staff Time Slots', recordType: 'Staff Time Slots' },
  'set-student-delete': { title: 'Student Delete', recordType: 'Student Delete' },
  'set-remove-session': { title: 'Remove Student Session', recordType: 'Remove Student Session' },
  'set-roles': { title: 'Roles Permission', recordType: 'Roles Permission' },
  'set-backup': { title: 'Backup / Restore', recordType: 'Backup / Restore' },
  'set-disabled-status': { title: 'Student Disabled Status', recordType: 'Student Disabled Status' },
  'set-users': { title: 'Users', recordType: 'Users' },
  'set-student-privilege': { title: 'Student Privilege', recordType: 'Student Privilege' },
  'set-staff-privilege': { title: 'Staff Privilege', recordType: 'Staff Privilege' },
};

const settingEntryFields: FieldDef[] = [
  { name: 'key', label: 'Setting Key', required: true, placeholder: 'e.g. institute_name' },
  { name: 'value', label: 'Setting Value', type: 'textarea', required: true },
  { name: 'description', label: 'Description' },
  { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
];

const settingEntryColumns: ColumnDef[] = [
  { key: 'key', label: 'Key' },
  { key: 'value', label: 'Value' },
  { key: 'description', label: 'Description' },
  { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
];

const settingRecordFields: FieldDef[] = [
  { name: 'name', label: 'Name / Title', required: true },
  { name: 'code', label: 'Code / Identifier' },
  { name: 'value', label: 'Configuration / Value', type: 'textarea' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
];

const settingRecordColumns: ColumnDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'value', label: 'Value' },
  { key: 'description', label: 'Description' },
  { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
];

export function Batch5ViewRenderer({ activeView }: { activeView: string }) {
  const entryConfig = SETTING_ENTRY_CATEGORIES[activeView];
  if (entryConfig) {
    return (
      <ErpCrudView
        key={activeView}
        title={entryConfig.title}
        breadcrumb={`System Setting / ${entryConfig.title}`}
        endpoint="system-setting/entries"
        fixedFilters={{ category: entryConfig.category }}
        transformPayload={(data) => ({ ...data, category: entryConfig.category })}
        fields={settingEntryFields}
        columns={settingEntryColumns}
      />
    );
  }

  const recordConfig = SETTING_RECORD_TYPES[activeView];
  if (recordConfig) {
    return (
      <ErpCrudView
        key={activeView}
        title={recordConfig.title}
        breadcrumb={`System Setting / ${recordConfig.title}`}
        endpoint="system-setting/records"
        fixedFilters={{ recordType: recordConfig.recordType }}
        transformPayload={(data) => ({ ...data, recordType: recordConfig.recordType })}
        fields={settingRecordFields}
        columns={settingRecordColumns}
      />
    );
  }

  switch (activeView) {
    // =========================================================================
    // 1. FRONT CMS (12)
    // =========================================================================
    case 'cms-events':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Events"
          breadcrumb="Front CMS / Events"
          endpoint="front-cms/events"
          fields={[
            { name: 'title', label: 'Event Title', required: true },
            { name: 'eventDate', label: 'Event Date', type: 'date' },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'venue', label: 'Venue' },
            { name: 'imageUrl', label: 'Image URL', type: 'url' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'eventDate', label: 'Event Date' },
            { key: 'startDate', label: 'Start Date' },
            { key: 'endDate', label: 'End Date' },
            { key: 'venue', label: 'Venue' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-sections':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Sections"
          breadcrumb="Front CMS / Sections"
          endpoint="front-cms/sections"
          fields={[
            { name: 'title', label: 'Section Title', required: true },
            { name: 'slug', label: 'Slug' },
            { name: 'order', label: 'Display Order', type: 'number', defaultValue: 0 },
            { name: 'content', label: 'Content', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'slug', label: 'Slug' },
            { key: 'order', label: 'Order' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-gallery':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Gallery"
          breadcrumb="Front CMS / Gallery"
          endpoint="front-cms/gallery"
          fields={[
            { name: 'title', label: 'Gallery Title', required: true },
            { name: 'category', label: 'Category' },
            { name: 'imageUrl', label: 'Image URL', type: 'url' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category' },
            { key: 'imageUrl', label: 'Image URL' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-notice':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Notices"
          breadcrumb="Front CMS / Notice"
          endpoint="front-cms/notices"
          fields={[
            { name: 'title', label: 'Notice Title', required: true },
            { name: 'publishDate', label: 'Publish Date', type: 'date' },
            { name: 'attachmentUrl', label: 'Attachment URL', type: 'url' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'publishDate', label: 'Publish Date' },
            { key: 'attachmentUrl', label: 'Attachment' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-media':
      return (
        <ErpCrudView
          key={activeView}
          title="Media Manager"
          breadcrumb="Front CMS / Media"
          endpoint="front-cms/media"
          fields={[
            { name: 'title', label: 'Media Title', required: true },
            { name: 'fileUrl', label: 'File URL', type: 'url' },
            { name: 'fileType', label: 'File Type', placeholder: 'e.g. image/png, application/pdf' },
            { name: 'fileSize', label: 'File Size', placeholder: 'e.g. 240 KB' },
            { name: 'altText', label: 'Alt Text' },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'fileType', label: 'Type' },
            { key: 'fileSize', label: 'Size' },
            { key: 'fileUrl', label: 'URL' },
            { key: 'altText', label: 'Alt Text' },
          ]}
        />
      );

    case 'cms-pages':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Pages"
          breadcrumb="Front CMS / Pages"
          endpoint="front-cms/pages"
          layout="modal"
          fields={[
            { name: 'title', label: 'Page Title', required: true },
            { name: 'slug', label: 'Slug' },
            { name: 'metaTitle', label: 'Meta Title' },
            { name: 'metaDescription', label: 'Meta Description', type: 'textarea' },
            { name: 'content', label: 'Page Content', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'slug', label: 'Slug' },
            { key: 'metaTitle', label: 'Meta Title' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-menus':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Menus"
          breadcrumb="Front CMS / Menus"
          endpoint="front-cms/menus"
          fields={[
            { name: 'title', label: 'Menu Title', required: true },
            { name: 'url', label: 'Target URL' },
            { name: 'parentId', label: 'Parent Menu ID' },
            { name: 'order', label: 'Order', type: 'number', defaultValue: 0 },
            { name: 'openInNewTab', label: 'Open in New Tab', type: 'checkbox', defaultValue: false },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'url', label: 'URL' },
            { key: 'order', label: 'Order' },
            {
              key: 'openInNewTab',
              label: 'New Tab',
              render: (row) => (row.openInNewTab ? 'Yes' : 'No'),
            },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-counter':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Counters"
          breadcrumb="Front CMS / Counter"
          endpoint="front-cms/counters"
          fields={[
            { name: 'title', label: 'Counter Title', required: true },
            { name: 'count', label: 'Count Value', type: 'number', defaultValue: 0 },
            { name: 'icon', label: 'Icon Name' },
            { name: 'order', label: 'Order', type: 'number', defaultValue: 0 },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'count', label: 'Count' },
            { key: 'icon', label: 'Icon' },
            { key: 'order', label: 'Order' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-banner':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Banners"
          breadcrumb="Front CMS / Banner"
          endpoint="front-cms/banners"
          fields={[
            { name: 'title', label: 'Banner Title', required: true },
            { name: 'subtitle', label: 'Subtitle' },
            { name: 'imageUrl', label: 'Image URL', type: 'url' },
            { name: 'linkUrl', label: 'Link URL', type: 'url' },
            { name: 'order', label: 'Order', type: 'number', defaultValue: 0 },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle' },
            { key: 'order', label: 'Order' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-testimonials':
      return (
        <ErpCrudView
          key={activeView}
          title="Testimonials"
          breadcrumb="Front CMS / Testimonials"
          endpoint="front-cms/testimonials"
          fields={[
            { name: 'name', label: 'Person Name', required: true },
            { name: 'designation', label: 'Designation' },
            { name: 'rating', label: 'Rating (1-5)', type: 'number', defaultValue: 5 },
            { name: 'avatarUrl', label: 'Avatar URL', type: 'url' },
            { name: 'message', label: 'Testimonial Message', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'designation', label: 'Designation' },
            { key: 'rating', label: 'Rating' },
            { key: 'message', label: 'Message' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-blogs':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Blogs"
          breadcrumb="Front CMS / Blogs"
          endpoint="front-cms/blogs"
          layout="modal"
          fields={[
            { name: 'title', label: 'Blog Title', required: true },
            { name: 'slug', label: 'Slug' },
            { name: 'author', label: 'Author' },
            { name: 'publishDate', label: 'Publish Date', type: 'date' },
            { name: 'imageUrl', label: 'Featured Image URL', type: 'url' },
            { name: 'content', label: 'Blog Content', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'author', label: 'Author' },
            { key: 'publishDate', label: 'Publish Date' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    case 'cms-courses':
      return (
        <ErpCrudView
          key={activeView}
          title="CMS Courses"
          breadcrumb="Front CMS / Courses"
          endpoint="front-cms/courses"
          layout="modal"
          fields={[
            { name: 'title', label: 'Course Title', required: true },
            { name: 'code', label: 'Course Code' },
            { name: 'duration', label: 'Duration', placeholder: 'e.g. 4 Years' },
            { name: 'imageUrl', label: 'Image URL', type: 'url' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
          ]}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'code', label: 'Code' },
            { key: 'duration', label: 'Duration' },
            { key: 'isActive', label: 'Status', render: (row) => <ActiveBadge value={row.isActive} /> },
          ]}
        />
      );

    // =========================================================================
    // 2. SUBSCRIPTION (1)
    // =========================================================================
    case 'sub-installment-report':
      return (
        <ErpCrudView
          key={activeView}
          title="Subscription Installment Report"
          breadcrumb="Subscription / Installment Report"
          endpoint="subscription/installments"
          layout="modal"
          filterFields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
            },
            { name: 'planName', label: 'Plan Name', placeholder: 'Filter by plan name' },
          ]}
          fields={[
            { name: 'planName', label: 'Plan Name', required: true },
            { name: 'installmentNo', label: 'Installment No.', type: 'number', defaultValue: 1 },
            { name: 'amount', label: 'Amount', type: 'number', required: true },
            { name: 'dueDate', label: 'Due Date', type: 'date' },
            { name: 'paidDate', label: 'Paid Date', type: 'date' },
            {
              name: 'paymentMode',
              label: 'Payment Mode',
              type: 'select',
              options: ['Online', 'UPI', 'Bank Transfer', 'Cheque', 'Cash'],
            },
            { name: 'transactionId', label: 'Transaction ID' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
              defaultValue: 'Pending',
            },
            { name: 'remarks', label: 'Remarks', type: 'textarea' },
          ]}
          columns={[
            { key: 'planName', label: 'Plan Name' },
            { key: 'installmentNo', label: 'Installment #' },
            { key: 'amount', label: 'Amount' },
            { key: 'dueDate', label: 'Due Date' },
            { key: 'paidDate', label: 'Paid Date' },
            { key: 'paymentMode', label: 'Mode' },
            { key: 'transactionId', label: 'Transaction ID' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          ]}
        />
      );

    default:
      return null;
  }
}
