import chevron
import prairielearn as pl
import lxml.html


def prepare(element_html, data):
    return data


def render(element_html, data):
    element = lxml.html.fragment_fromstring(element_html)
    width = pl.get_integer_attrib(element, 'width', 600)
    height = pl.get_integer_attrib(element, 'height', 700)
    if data['panel'] == 'question':
        if len(data['raw_submitted_answers']) == 0:
            skp_json = ''
        else:
            skp_json = data['raw_submitted_answers']

        html_params = {
            'uuid': pl.get_uuid(),
            'sketchpad_json': skp_json,
            'test_elem': 'hello world',
            'width': width,
            'height': height
        }

        with open('pl-sketch.mustache', 'r') as f:
            return chevron.render(f, html_params).strip()
    else:
        return ''


def grade(element_html, data):
    data['partial_scores']['pl-sketch-unique-name'] = {'score': 1, 'weight': 1}
    return data
