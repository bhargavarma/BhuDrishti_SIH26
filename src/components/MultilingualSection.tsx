import {
  ScanText,
  Languages,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

const languages = [
  'Hindi',
  'Telugu',
  'Kannada',
  'Tamil',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Malayalam',
]

function MultilingualSection() {
  return (
    <section id="features" className="multilingual-section">
      <div className="section-container">

        <div className="multilingual-heading">

          <div className="multilingual-label">
            <Languages size={14} />
            MULTILINGUAL DOCUMENT INTELLIGENCE
          </div>

          <h2>
            One Platform.
            <br />
            <span>Many Languages.</span>
          </h2>

          <p>
            Read and understand land records across Indian languages,
            scripts and document formats without forcing every record
            into a single language.
          </p>

        </div>

        <div className="multilingual-layout">

          {/* DOCUMENT SIDE */}

          <div className="language-document">

            <div className="document-topbar">
              <div className="document-file">
                <ScanText size={17} />
                LAND_RECORD_1423
              </div>

              <div className="document-status">
                <span />
                OCR READY
              </div>
            </div>

            <div className="document-paper">

              <div className="paper-header">
                <span>తెలంగాణ భూ రికార్డు</span>
                <small>LAND RECORD</small>
              </div>

              <div className="paper-line long" />
              <div className="paper-line medium" />

              <div className="paper-fields">

                <div>
                  <small>పట్టాదారు పేరు</small>
                  <strong>రమేష్ కుమార్</strong>
                </div>

                <div>
                  <small>సర్వే నంబర్</small>
                  <strong>142/3A</strong>
                </div>

                <div>
                  <small>విస్తీర్ణం</small>
                  <strong>2.47 ఎకరాలు</strong>
                </div>

              </div>

              <div className="paper-line full" />
              <div className="paper-line long" />
              <div className="paper-line short" />
              <div className="paper-line medium" />

              <div className="handwritten-mark">
                ✎
              </div>

            </div>

            <div className="language-detected">
              <Languages size={16} />

              <div>
                <span>LANGUAGE DETECTED</span>
                <strong>Telugu · తెలుగు</strong>
              </div>

              <CheckCircle2 size={18} />
            </div>

          </div>

          {/* AI EXTRACTION SIDE */}

          <div className="extraction-panel">

            <div className="extraction-header">
              <div className="extraction-icon">
                <Sparkles size={19} />
              </div>

              <div>
                <span>AI DOCUMENT UNDERSTANDING</span>
                <h3>Structured Information</h3>
              </div>
            </div>

            <div className="extracted-fields">

              <div className="extracted-field">
                <div>
                  <span>OWNER NAME</span>
                  <strong>Ramesh Kumar</strong>
                </div>

                <div className="field-confidence">
                  98%
                </div>
              </div>

              <div className="extracted-field">
                <div>
                  <span>SURVEY NUMBER</span>
                  <strong>142/3A</strong>
                </div>

                <div className="field-confidence">
                  99%
                </div>
              </div>

              <div className="extracted-field">
                <div>
                  <span>PLOT AREA</span>
                  <strong>2.47 Acres</strong>
                </div>

                <div className="field-confidence">
                  96%
                </div>
              </div>

              <div className="extracted-field">
                <div>
                  <span>LAND CLASSIFICATION</span>
                  <strong>Agricultural</strong>
                </div>

                <div className="field-confidence">
                  94%
                </div>
              </div>

            </div>

            <div className="extraction-footer">
              <CheckCircle2 size={16} />
              <span>4 fields successfully extracted</span>
            </div>

          </div>

        </div>

        {/* LANGUAGE STRIP */}

        <div className="language-strip">

          <div className="language-strip-title">
            <Languages size={16} />
            Supported Indian languages
          </div>

          <div className="language-pills">

            {languages.map((language, index) => (
              <span
                key={language}
                className={index === 1 ? 'language-pill active' : 'language-pill'}
              >
                {language}
              </span>
            ))}

          </div>

          <div className="language-note">
            <span>
              Detect
            </span>

            <ArrowRight size={15} />

            <span>
              Read
            </span>

            <ArrowRight size={15} />

            <span>
              Understand
            </span>

            <ArrowRight size={15} />

            <strong>
              Structure
            </strong>
          </div>

        </div>

      </div>
    </section>
  )
}

export default MultilingualSection