/* eslint-disable react/prop-types */

import React from 'react';

const CampaignDashboardDot = ({ cx, cy, payload }) => {
  if (payload.campaignStart === true) {
    return (
      <svg x={cx - 50} y={cy - 50} width={100} height={100} fill="#5E9CD3" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="1"/>
      </svg>
    );
  }

  return <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 1024 1024" />;
};

export default CampaignDashboardDot;
