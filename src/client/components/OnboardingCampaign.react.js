/* eslint-disable react/prop-types */

import React from 'react'
import { Field } from 'redux-form'

const OnboardingCampaign = ({ handleSubmit, pristine, reset, submitting, onSave }) => (
  <form onSubmit={handleSubmit}>
    <div className="form-horizontal">
      <h1> Campaign Onboarding Page </h1>
        <div className="row">
          <div className="col-md-8">
        <div className="form-group ">
          <label className="col-sm-3 control-label">First Name</label>
          <div className="col-sm-1 text-right" />
            <div className="col-sm-8">
              <Field name="firstName" className="form-control" component="input" type="text" placeholder="First Name"/>
            </div>
          </div>
          <div className="form-group ">
            <label className="col-sm-3 control-label">Last Name</label>
            <div className="col-sm-1 text-right" />
            <div className="col-sm-8">
              <Field name="lastName" className="form-control" component="input" type="text" placeholder="Last Name"/>
            </div>
          </div>
          <div className="form-group ">
            <label className="col-sm-3 control-label">Email</label>
            <div className="col-sm-1 text-right" />
            <div className="col-sm-8">
              <Field name="email" className="form-control" component="input" type="email" placeholder="Email"/>
            </div>
          </div>
        </div>
      </div>
      <div className="form-submit text-right">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={pristine || submitting}
          onClick={() => handleSubmit(onSave)}
        >
          Submit
        </button>
        <button
          className="btn btn-default"
          type="button"
          disabled={pristine || submitting}
          onClick={reset}
        >
          Clear Values
        </button>
      </div>
    </div>
  </form>
)

export default OnboardingCampaign;
