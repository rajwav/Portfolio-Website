import { usePortfolioData } from "../context/usePortfolioData";
import "./styles/Career.css";

const Career = () => {
  const { data } = usePortfolioData();
  const milestones = (data.path_milestones || [])
    .filter((m) => m.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          THE <span>PATH</span>
          <br /> EVOLUTION
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {milestones.map((item) => (
            <div key={item.id || item.year} className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{item.title}</h4>
                  <h5>{item.organization}</h5>
                </div>
                <h3>{item.year}</h3>
              </div>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
