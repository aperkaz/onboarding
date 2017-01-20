import _ from 'lodash';

export default class emailTemplate {
  constructor() {
    let templates = {
      email: {
        template1: {
          id: 'template1',
          name: 'Template 1',
          thumbnail: '/campaigns/images/templates/email/template1.png'
        },
        template2: {
          id: 'template2',
          name: 'Template 2',
          thumbnail: '/campaigns/images/templates/email/template2.png'
        },
        template3: {
          id: 'template3',
          name: 'Template 3',
          thumbnail: '/campaigns/images/templates/email/template3.png'
        }
      },
      onboarding: {
        template1: {
          id: 'template1',
          name: 'Template 1',
          thumbnail: '/campaigns/images/templates/onboarding/template1.png'
        },
        template2: {
          id: 'template2',
          name: 'Template 2',
          thumbnail: '/campaigns/images/templates/onboarding/template2.png'
        },
        template3: {
          id: 'template3',
          name: 'Template 3',
          thumbnail: '/campaigns/images/templates/onboarding/template3.png'
        }
      }
    }

    let types = {
      email: {
        name: 'Email'
      },
      onboarding: {
        name: 'OnBoard'
      }
    }

    let defaultTemplates = {
      email: 'template1',
      onboarding: 'template1'
    }

    let defaultType = 'email';

    this.get = function(type = defaultType, id) {
      if (id) {
        return templates[type] && templates[type][id] ? templates[type][id] : {};
      } else {
        return templates[type];
      }
    }

    this.getDefaultTemplate = function(type = defaultType) {
      return defaultTemplates[type];
    }
  }
}
