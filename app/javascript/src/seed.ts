export default {
  story: {
    id: '4f4b1e22-5fa3-4b4d-8a01-7fe86a1f660e',
    offsetX: 0,
    offsetY: 0,
    zoom: 100,
    gridSize: 0,
    links: [
      {
        id: 'b0bcbc51-9046-45e6-b38a-80b62f07120b',
        type: 'default',
        selected: false,
        source: '94913fcb-4d8e-4314-b99e-e24646d5e551',
        sourcePort: 'a0786b8b-8508-4328-b367-3c3a28976a0d',
        target: '38388378-6f4c-4631-884a-f63ff3ac8fb1',
        targetPort: '434b32bc-170d-41d2-9d31-9700be9033f9',
        points: [
          {
            id: '2b06a74b-88fe-479f-9392-77da960cda16',
            selected: false,
            x: 367.9374905661851,
            y: 271.5000120362467
          },
          {
            id: 'f1adab1e-7086-4e9f-8895-258b232b2278',
            selected: false,
            x: 442.7567375798836,
            y: 241.44505340425425
          }
        ],
        extras: {},
        labels: [],
        width: 3,
        color: 'rgba(255,255,255,0.5)',
        curvyness: 50
      },
      {
        id: '5d5a6262-5da2-4514-aeae-4efd3cf13ad5',
        type: 'default',
        selected: false,
        source: '94913fcb-4d8e-4314-b99e-e24646d5e551',
        sourcePort: '5681e7ad-2b1f-4629-9ff4-0a4092e75a89',
        target: '9e59af2a-a4dd-4e2d-ac68-14f344ecb4db',
        targetPort: '0ae3490a-2034-487d-81ce-a42c5011e772',
        points: [
          {
            id: 'efe043ca-dd4d-42be-8a77-c5e628def55b',
            selected: false,
            x: 367.9374905661851,
            y: 314.5000013825418
          },
          {
            id: 'a9509f15-46c7-4412-8580-1aa25062f5c9',
            selected: false,
            x: 449.4242368708219,
            y: 391.7070053589679
          }
        ],
        extras: {},
        labels: [],
        width: 3,
        color: 'rgba(255,255,255,0.5)',
        curvyness: 50
      }
    ],
    nodes: [
      {
        id: '94913fcb-4d8e-4314-b99e-e24646d5e551',
        type: 'default',
        selected: true,
        x: 121,
        y: 246,
        extras: {},
        ports: [
          {
            id: 'a0786b8b-8508-4328-b367-3c3a28976a0d',
            type: 'default',
            selected: false,
            name: '46e10351-0ca5-445c-b41b-5726d7abcd50',
            parentNode: '94913fcb-4d8e-4314-b99e-e24646d5e551',
            links: ['b0bcbc51-9046-45e6-b38a-80b62f07120b'],
            in: false,
            label: 'Choice 1'
          },
          {
            id: '5681e7ad-2b1f-4629-9ff4-0a4092e75a89',
            type: 'default',
            selected: false,
            name: '75ee643b-e9f4-4f71-96bc-daa9e62b05db',
            parentNode: '94913fcb-4d8e-4314-b99e-e24646d5e551',
            links: ['5d5a6262-5da2-4514-aeae-4efd3cf13ad5'],
            in: false,
            label: 'Choice 2'
          }
        ],
        name: 'Start',
        color: '#4CAF50'
      },
      {
        id: '38388378-6f4c-4631-884a-f63ff3ac8fb1',
        type: 'default',
        selected: false,
        x: 444.7673906340974,
        y: 203.44928447026237,
        extras: {},
        ports: [
          {
            id: '434b32bc-170d-41d2-9d31-9700be9033f9',
            type: 'default',
            selected: false,
            name: '01247fcc-ed87-488b-9edd-13b9279856a0',
            parentNode: '38388378-6f4c-4631-884a-f63ff3ac8fb1',
            links: ['b0bcbc51-9046-45e6-b38a-80b62f07120b'],
            in: true,
            label: 'Input'
          }
        ],
        name: 'Decision 1',
        color: '#f6412d'
      },
      {
        id: '9e59af2a-a4dd-4e2d-ac68-14f344ecb4db',
        type: 'default',
        selected: false,
        x: 451.42860245001907,
        y: 353.7076665392747,
        extras: {},
        ports: [
          {
            id: '0ae3490a-2034-487d-81ce-a42c5011e772',
            type: 'default',
            selected: false,
            name: 'd003fe27-f7c6-4100-b128-d703a7f4f1b1',
            parentNode: '9e59af2a-a4dd-4e2d-ac68-14f344ecb4db',
            links: ['5d5a6262-5da2-4514-aeae-4efd3cf13ad5'],
            in: true,
            label: 'Input'
          }
        ],
        name: 'Decision 2',
        color: '#f6412d'
      }
    ]
  },
  meta: {
    '94913fcb-4d8e-4314-b99e-e24646d5e551': {
      text:
        "<p>This the starting scene, where you introduce your story to the reader. It's marked in green so you can find it easily.</p><p>Feel free to edit this text, the name above, and the choices below to write your first story.<br></p><p>If you don't set any choices for a scene, that scene is&nbsp;considered an end to the story and marked in red.</p>"
    },
    '38388378-6f4c-4631-884a-f63ff3ac8fb1': {
      text:
        '<p>This content is shown to the reader if they choose "Choice 1" in the opening scene.</p>'
    },
    '9e59af2a-a4dd-4e2d-ac68-14f344ecb4db': {
      text:
        '<p>This content is shown to the reader if they choose "Choice 2" in the opening scene.</p>'
    }
  }
}
