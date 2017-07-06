export default class emailTemplate {
  constructor() {
    let templates = {
      email: {
        template1: {
          id: 'template1',
          name: 'Template 1',
          thumbnail: '/static/images/templates/email/template1.png',
          size: { w: 150, h: 174 }
        }
      },
      onboarding: {
        template1: {
          id: 'template1',
          name: 'Template 1',
          thumbnail: '/static/images/templates/onboarding/template1.png',
          size: { w: 193, h: 166 }
        }
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
