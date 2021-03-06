/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import assign from 'object-assign';
import React from 'react';
import { PureRenderMixin } from 'react/addons';

import { FormElement } from 'components/forms';
import { FormMixin } from 'mixins/forms';

import RequestPasswordResetProgress from './RequestPasswordResetProgress';


let RequestPasswordResetForm = React.createClass({
  mixins: [PureRenderMixin, FormMixin],

  propTypes: {
    canRegister: React.PropTypes.bool.isRequired,
    formErrors: React.PropTypes.object.isRequired,
    isLoading: React.PropTypes.bool.isRequired,
  },


  /* Lifecycle */

  getInitialState() {
    this.initialData = {
      email: '',
    };
    return {
      formData: assign({}, this.initialData),
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.state.errors !== nextProps.formErrors) {
      this.setState({errors: nextProps.formErrors});
    }
  },


  /* Handlers */

  handleSignIn(e) {
    e.preventDefault();
    this.props.flux.getActions('auth').gotoScreen('signIn');
  },

  handleSignUp(e) {
    e.preventDefault();
    this.props.flux.getActions('auth').gotoScreen('signUp');
  },

  handleFormSubmit(e) {
    e.preventDefault();
    this.props.flux.getActions('auth').requestPasswordReset(this.state.formData);
  },


  /* Others */

  hasData() {
    return this.state.formData.email !== '';
  },


  /* Layout */

  render() {
    if (this.props.isLoading) {
      return <RequestPasswordResetProgress email={this.state.formData.email} />;
    }

    let errors = this.state.errors;
    let data = this.state.formData;

    return (
      <form
        method="post"
        onSubmit={this.handleFormSubmit}>
        <div className="fields">
          {this.renderAllFormErrors()}
          <FormElement
            type="email"
            attribute="email"
            label={gettext('Email Address')}
            help={gettext('Enter your email address, and we will send you a message with the special link to reset your password.')}
            autoFocus={true}
            handleChange={this.handleChange}
            formData={data}
            errors={errors}
          />
        </div>
        <div className="actions">
          <div>
            <a href="#" onClick={this.handleSignIn}>
              {gettext('No, thanks')}
            </a>
          </div>
          <div>
            <input
              type="submit"
              className="btn btn-primary"
              disabled={!this.hasData()}
              value={gettext('Send Email')}
            />
          </div>
          {this.props.canRegister &&
            <div>
              <a href="#" onClick={this.handleSignUp}>
                {gettext('Sign up as a new user')}
              </a>
            </div>
          }
        </div>
      </form>
    );
  }

});


export default RequestPasswordResetForm;
