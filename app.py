import streamlit as st
import os
import PyPDF2 as pdf
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai
import time

# Load environment variables (for local testing, if needed)
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    st.error("Google API key not found. Please configure it in Streamlit Secrets.")
    st.stop()
genai.configure(api_key=api_key)

# Prompt Template (Advanced)
input_prompt = """
You are an advanced AI-powered ATS and resume evaluator.

Analyze the resume against the job description provided.
Evaluate it critically and provide section-wise improvement suggestions.
Focus on improving the resume for maximum impact and alignment with the JD.

Resume: {text}
Job Description: {jd}

Return the result in the following JSON format:
{{
  "JD Match": "XX%",
  "MissingKeywords": ["keyword1", "keyword2", ...],
  "SectionSuggestions": {{
    "Summary": "Your suggestion here",
    "Skills": "Your suggestion here",
    "Experience": "Your suggestion here",
    "Education": "Your suggestion here",
    "Projects": "Your suggestion here"
  }},
  "Profile Summary": "Overall evaluation of the candidate's profile."
}}
"""

# Set page configuration
st.set_page_config(
    page_title="Smart ATS - Resume Analyzer",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)


# Extract text from PDF
def input_pdf_text(uploaded_file):
    try:
        reader = pdf.PdfReader(uploaded_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        return f"Error processing PDF: {str(e)}"


# Get Gemini response
def get_gemini_response(input_text):
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content(input_text)
        return response.text
    except Exception as e:
        return f"Error generating response: {str(e)}"


# Parse JSON safely
def parse_response(response_text):
    try:
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        else:
            return {"raw_response": response_text}
    except Exception as e:
        return {"raw_response": response_text, "error": str(e)}


# Create animated loading
def loading_animation():
    progress_bar = st.progress(0)
    status_text = st.empty()

    stages = [
        "Reading resume...",
        "Analyzing job description...",
        "Identifying keywords...",
        "Calculating match percentage...",
        "Generating suggestions...",
        "Creating profile summary...",
        "Finalizing report..."
    ]

    for i, stage in enumerate(stages):
        progress = (i + 1) / len(stages)
        progress_bar.progress(progress)
        status_text.text(f"⏳ {stage}")
        time.sleep(0.7)

    progress_bar.progress(1.0)
    status_text.text("✅ Analysis complete!")
    time.sleep(0.5)
    progress_bar.empty()
    status_text.empty()


# Header section with animation
st.markdown("""
<div style="text-align: center;">
    <h1>📄 Smart ATS: AI-Powered Resume Analyzer</h1>
    <p style="font-size: 1.2rem; margin-bottom: 2rem;">
        Get personalized feedback on your resume and boost your chances of landing that dream job!
    </p>
</div>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/000000/resume.png")

    st.header("📚 How to Use")
    st.markdown("""
    <ol>
        <li>Paste the <b>Job Description</b> in the text area</li>
        <li>Upload your <b>Resume (PDF format)</b></li>
        <li>Click <b>Analyze</b> to get AI-powered insights</li>
    </ol>
    """, unsafe_allow_html=True)

    st.markdown("---")

    st.header("🔍 Why Use This Tool?")
    st.markdown("""
    - Get matched against actual ATS systems
    - Receive section-by-section improvement tips
    - Identify missing keywords that matter
    - Improve your job match percentage
    - Streamline your application process
    """)

    st.markdown("---")

    debug_mode = st.checkbox("🛠️ Debug Mode")

    st.caption("Powered by Google Gemini AI")

# Main content area
st.subheader("Job & Resume Details")

col1, col2 = st.columns(2)
with col1:
    st.markdown("### 📌 Job Description")
    jd = st.text_area("Paste the job description here", height=300, key="jd_input",
                      placeholder="Copy and paste the job description from the posting...")
    st.markdown(
        '<p style="color: grey; font-size: 0.8rem; margin-top: 0.25rem; font-style: italic;">📝 Please make sure to paste the complete job description and press Ctrl+Enter when done.</p>',
        unsafe_allow_html=True)
with col2:
    st.markdown("### 📎 Your Resume")
    uploaded_file = st.file_uploader("Upload your resume (PDF only)", type="pdf")

    if uploaded_file is not None:
        st.success(f"Uploaded: {uploaded_file.name}")
        st.markdown("""
        <div style="border: 1px dashed grey; border-radius: 5px; padding: 10px; text-align: center;">
            <img src="https://img.icons8.com/color/48/000000/pdf.png" style="margin: 10px;"/>
            <p>PDF file ready for analysis</p>
        </div>
        """, unsafe_allow_html=True)

analyze_button = st.button("🚀 Analyze Resume", type="primary", use_container_width=True)

# Results section within the main area
if analyze_button:
    if not jd:
        st.error("🚫 Please paste the job description before analyzing.")
    elif not uploaded_file:
        st.error("🚫 Please upload your resume (PDF format) before analyzing.")
    else:
        with st.spinner("Analyzing your resume..."):
            loading_animation()

            resume_text = input_pdf_text(uploaded_file)

            if "Error" in resume_text:
                st.error(resume_text)
            else:
                full_prompt = input_prompt.format(text=resume_text, jd=jd)

                if debug_mode:
                    st.subheader("🔍 Debug: Prompt Sent to Gemini")
                    st.code(full_prompt, language='markdown')

                response = get_gemini_response(full_prompt)

                if debug_mode:
                    st.subheader("🔍 Debug: Raw Gemini Response")
                    st.text(response)

                parsed_result = parse_response(response)

                if "JD Match" in parsed_result:
                    st.markdown("## ✨ Resume Analysis Results")

                    # Match percentage with progress bar
                    match_str = parsed_result["JD Match"].strip("%")
                    try:
                        match_value = int(match_str)
                    except:
                        match_value = 0

                    col1, col2, col3 = st.columns([1, 2, 1])
                    with col2:
                        st.markdown(f"<h3 style='text-align: center;'>🎯 Job Description Match</h3>",
                                    unsafe_allow_html=True)

                        # Determine color based on match percentage
                        color = "red" if match_value < 50 else "orange" if match_value < 75 else "green"

                        st.markdown(f"""
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <div style="position: relative; height: 150px; width: 150px; margin: 0 auto;">
                                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 2.5rem; font-weight: bold; color: {color};">{parsed_result["JD Match"]}</span>
                                </div>
                                <svg viewBox="0 0 36 36" style="height: 100%; width: 100%; transform: rotate(-90deg);">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#E5E7EB"
                                        stroke-width="3"
                                        stroke-dasharray="100, 100"/>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="{color}"
                                        stroke-width="3"
                                        stroke-dasharray="{match_value}, 100"/>
                                </svg>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                    # Missing Keywords
                    st.markdown("### 🧩 Missing Keywords")
                    if parsed_result["MissingKeywords"] and len(parsed_result["MissingKeywords"]) > 0:
                        missing_keywords_text = ", ".join(parsed_result["MissingKeywords"])
                        st.write(f"Missing Keywords: {missing_keywords_text}")
                    else:
                        st.success("✅ Great job! No missing keywords found.")

                    # Section Suggestions
                    st.markdown("### 🛠️ Section-wise Suggestions")
                    for section, suggestion in parsed_result.get("SectionSuggestions", {}).items():
                        st.subheader(section)
                        st.write(suggestion)

                    # Profile Summary
                    st.markdown("### 🧠 Overall Profile Evaluation")
                    st.write(parsed_result["Profile Summary"])

                    st.markdown("""
                    <div style="text-align: center; margin-top: 2rem;">
                        <p style="font-size: 0.9rem; color: grey;">Want to improve your resume even more?
                        Consider using these suggestions to edit your resume before your next application.</p>
                    </div>
                    """, unsafe_allow_html=True)

                else:
                    st.warning("⚠️ Could not parse Gemini response correctly.")
                    st.text(parsed_result.get("raw_response", "No response found."))

# Footer
st.markdown("""
<div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #E5E7EB; text-align: center;">
    <p style="color: grey; font-size: 0.875rem;">Smart ATS Resume Analyzer | Powered by Google Gemini AI</p>
</div>
""", unsafe_allow_html=True)
