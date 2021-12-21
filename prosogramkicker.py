import os
import argparse

parser = argparse.ArgumentParser(
    prog='prosogramkicker.py',
    usage='python prosogramkicker.py --sound filename [options]',
    description='Wrapper script to invoke "prosogram.praat" from command line.',
    epilog='end',
    add_help=True,
    )

parser.add_argument('--praatPath', default='/Applications/Praat.app/Contents/MacOS/Praat', metavar=('PathForPraat'))
parser.add_argument('--prosogramPath', default='/Users/masaakimurakami/downloads/PROSOGRAM/prosogram_v300f/prosogram.praat', metavar=('PathForProsogramScript'))

parser.add_argument('--task', default='0', metavar=('Task {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}'))
parser.add_argument('--sound', default='', metavar=('SoudPathname'))
parser.add_argument('--time', nargs=2, default=[0.0, 0.0], metavar=('from(sec)', 'to(sec)'))
parser.add_argument('--f0', nargs=2, default=[0, 450], metavar=('F0low(Hz)', 'F0high(Hz)'))
parser.add_argument('--pcalc', default='1', metavar=('ParameterCalc {1, 2}'))
parser.add_argument('--fperiod', default='1', metavar=('FramePeriod {1, 2}'))
parser.add_argument('--smethod', default='1', metavar=('SegmentationMethod {1, 2, 3, 4, 5, 6, 7}'))
parser.add_argument('--threshold', default='6', metavar=('Thresholds {1, 2, 3, 4, 5, 6'))
parser.add_argument('--view', default='3', metavar=('View {1, 2, 3, 4, 5, 6, 7, 8, 9}'))
parser.add_argument('--tips', default='3.0', metavar=('TimeIntervalPerStrip(sec)'))
parser.add_argument('--tts', default='*1, 2, 3', metavar=('TiersToShow'))
parser.add_argument('--font', default='1', metavar=('Font {1, 2, 3, 4}'))
parser.add_argument('--prange', nargs=2, default=[0, 100], metavar=('PitchFrom', 'PitchTo'))
parser.add_argument('--omode', default='1', metavar=('OutputMode'))
parser.add_argument('--oformat', default='1', metavar=('OutputFormat'))
parser.add_argument('--path', default='<input_directory>/<basename>_', metavar=('Path&Filename4graphicsFile'))

def isInt(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def getSelection(val, tab):
    if isInt(val):
        v = int(val)
        if v > 0 and v < len(tab):
            return tab[v]
    print("ERROR")
    print(val)
    print(tab)
    exit()

def concat2(array):
    return str(array[0]) + " " + str(array[1])

_TaskArray = [
    1,
    'Prosogram (writes graphics files)',
    'Calculate intermediate data files & Prosodic profile (no graphics files)',
    'Prosogram, intermediate data files & Prosodic profile',
    'Polytonia',
    'Interactive prosogram',
    'Recalculate pitch for entire sound file',
    'Recalculate intensity after BP filtering for entire sound file',
    'Make automatic segmentation into syllables and save',
    'Validate syllable tier',
]
_ParmCalcArray = [
    1,
    'Full (saved in file)',
    'Partial (not saved in file)',
]
_FramePeriodArray = [
    1,
    '0.005',
    '0.01',
]
_SegmentationMethodArray = [
    1,
    'Select optimal method for TextGrid (if any) ',
    'Automatic: acoustic syllables',
    'Nuclei in vowels in tier "phon"',
    'Nuclei in rhyme from "syll" and vowels in "phon"',
    'Nuclei in syllables in "syll" and vowels in "phon"',
    'Nuclei in syllables in "syll" and local peak',
    'Using external segmentation in tier "segm"',
]
_ThresholdArray = [
    6,
    'G=0.16/T^2, DG=20, dmin=0.035',
    'G=0.24/T^2, DG=20, dmin=0.035',
    'G=0.32/T^2, DG=20, dmin=0.035',
    'G=0.32/T^2, DG=30, dmin=0.050',
    'G=0.24-0.32/T^2 (adaptive), DG=30, dmin=0.050',
    'G=0.16-0.32/T^2 (adaptive), DG=30, dmin=0.050',
]
_ViewArray = [
    3,
    'Compact, light',
    'Compact, rich',
    'Wide, light',
    'Wide, light, with pitch range',
    'Wide, light, with f0 and pitch range',
    'Wide, rich',
    'Wide, rich, with pitch range',
    'Wide, rich, with values pitch targets in semitones',
    'Wide, rich, with values pitch targets in Hertz',
]
_FontArray = [
    1,
    'Times 10',
    'Times 8',
    'Helvetica 10',
    'Helvetica 8',
]
_OutputModeArray = [
    1,
    'Fill page with strips',
    'One strip per file',
]
_OutputFormatArray = [
    1,
    'PNG 300 dpi',
    'PNG 600 dpi',
    'EPS (Encapsulated Postscript)',
    'PDF',
    'EPS and JPG 300 dpi (Windows, Ghostscript must be installed)',
    'EPS and JPG 600 dpi (Windows, Ghostscript must be installed)',
]


args = parser.parse_args()
pwd = os.getcwd() + '/'
if args.sound == '':
    print('Need --sound parameter!')
    exit()
if args.task == '0':
    os.system(f'"{args.praatPath}" --run "{args.prosogramPath}" "{getSelection("2", _TaskArray)}" "{pwd + args.sound}" {concat2(args.time)} {concat2(args.f0)} "{getSelection(args.pcalc, _ParmCalcArray)}" "{getSelection(args.fperiod, _FramePeriodArray)}" "{getSelection(args.smethod, _SegmentationMethodArray)}" "{getSelection(args.threshold, _ThresholdArray)}" "{getSelection(args.view, _ViewArray)}" "{args.tips}" "{args.tts}" "{getSelection(args.font, _FontArray)}" {concat2(args.prange)} "{getSelection(args.omode, _OutputModeArray)}" "{getSelection(args.oformat, _OutputFormatArray)}" "{args.path}"')
    os.system(f'"{args.praatPath}" --run "{args.prosogramPath}" "{getSelection("5", _TaskArray)}" "{pwd + args.sound}" {concat2(args.time)} {concat2(args.f0)} "{getSelection(args.pcalc, _ParmCalcArray)}" "{getSelection(args.fperiod, _FramePeriodArray)}" "{getSelection(args.smethod, _SegmentationMethodArray)}" "{getSelection(args.threshold, _ThresholdArray)}" "{getSelection(args.view, _ViewArray)}" "{args.tips}" "{args.tts}" "{getSelection(args.font, _FontArray)}" {concat2(args.prange)} "{getSelection(args.omode, _OutputModeArray)}" "{getSelection(args.oformat, _OutputFormatArray)}" "{args.path}"')
else:
    os.system(f'"{args.praatPath}" --run "{args.prosogramPath}" "{getSelection(args.task, _TaskArray)}" "{pwd + args.sound}" {concat2(args.time)} {concat2(args.f0)} "{getSelection(args.pcalc, _ParmCalcArray)}" "{getSelection(args.fperiod, _FramePeriodArray)}" "{getSelection(args.smethod, _SegmentationMethodArray)}" "{getSelection(args.threshold, _ThresholdArray)}" "{getSelection(args.view, _ViewArray)}" "{args.tips}" "{args.tts}" "{getSelection(args.font, _FontArray)}" {concat2(args.prange)} "{getSelection(args.omode, _OutputModeArray)}" "{getSelection(args.oformat, _OutputFormatArray)}" "{args.path}"')

