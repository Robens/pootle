/*
 * Copyright (C) Pootle contributors.
 *
 * This file is a part of the Pootle project. It is distributed under the GPL3
 * or later license. See the LICENSE file for a copy of the license and the
 * AUTHORS file for copyright and authorship information.
 */

'use strict';

import React from 'react';
import { PureRenderMixin } from 'react/addons';

import AuthContent from './AuthContent';


let AccountActivation = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    signUpEmail: React.PropTypes.string,
  },


  /* Layout */

  render() {
    let emailLinkMsg;

    if (this.props.signUpEmail) {
      emailLinkMsg = interpolate(
        gettext('We have sent an email to <span>%s</span> containing the special link.'),
        [this.props.signUpEmail]
      );
    } else {
      emailLinkMsg = gettext(
        'We have sent an email to the address you used to register this account containing the special link.'
      );
    }

    let activationWarningMsg = gettext('Your account needs activation.');
    let instructionsMsg = gettext('Please follow that link to continue the account creation.');

    return (
      <AuthContent>
        <p>{activationWarningMsg}</p>
        <p dangerouslySetInnerHTML={{__html: emailLinkMsg}} />
        <p>{instructionsMsg}</p>
        {this.props.signUpEmail &&
          <div>
            <button
              className="btn btn-primary"
              onClick={this.props.onClose}
            >
              {gettext('Close')}
            </button>
          </div>
        }
      </AuthContent>
    );
  }

});


export default AccountActivation;
