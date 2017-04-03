export default class emailTemplate {
  constructor() {
    let templates = {
      email: {
        template1: {
          id: 'template1',
          name: 'Template 1',
          thumbnail: '/static/images/templates/email/template1.png',
          size: { w: 150, h: 174 }
        },
        template2: {
          id: 'template2',
          name: 'Template 2',
          thumbnail: '/static/images/templates/email/template2.png',
          size: { w: 125, h: 156 }
        },
        template3: {
          id: 'template3',
          name: 'Template 3',
          thumbnail: '/static/images/templates/email/template3.png',
          size: { w: 131, h: 163 }
        }
      },
      onboarding: {
        template1: {
          id: 'template1',
          name: 'Template 1',
          thumbnail: '/static/images/templates/onboarding/template1.png',
          size: { w: 193, h: 166 }
        },
        template2: {
          id: 'template2',
          name: 'Template 2',
          thumbnail: '/static/images/templates/onboarding/template2.png',
          size: { w: 187, h: 136 }
        },
        template3: {
          id: 'template3',
          name: 'Template 3',
          thumbnail: '/static/images/templates/onboarding/template3.png',
          size: { w: 150, h: 162 }
        }
      }
    }

    // let types = {
    //   email: {
    //     name: 'Email'
    //   },
    //   onboarding: {
    //     name: 'OnBoard'
    //   }
    // }

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
