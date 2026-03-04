import React from 'react';
import { Tabs } from 'antd';
import { FileTextOutlined, ToolOutlined, CalendarOutlined } from '@ant-design/icons';
import FollowUps from './FollowUps';

export default function FollowUpsTabs() {
  const tabLabel = (icon, text) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {icon}
      <span>{text}</span>
    </span>
  );

  const items = [
    {
      key: 'quotation',
      label: tabLabel(<FileTextOutlined />, 'Quotation'),
      children: <FollowUps mode="quotation" />,
    },
    {
      key: 'jobcard',
      label: tabLabel(<ToolOutlined />, 'Job Card'),
      children: <FollowUps mode="jobcard" />,
    },
    
  ];

  return (
    <Tabs
      defaultActiveKey="quotation"
      items={items}
      destroyInactiveTabPane
    />
  );
}
