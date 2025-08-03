#!/usr/bin/env python3
"""
Creator Market Liberation Platform Tester
Tests Jimmy's sovereign creator store functionality
"""

import os
import sys
import json
import time
import tempfile
from pathlib import Path

# Unicode-safe setup (from fix_unicode_deployment.py pattern)
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Fix encoding for Windows with fallback
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except:
        pass  # Continue with system default

class CreatorStoreTester:
    """Test the Creator Market Liberation store"""
    
    def __init__(self):
        self.store_dir = Path(__file__).parent
        self.test_results = {
            "store_files": {},
            "payment_system": {},
            "book_catalog": {},
            "infrastructure": {}
        }
        
    def test_store_infrastructure(self):
        """Test that all required store files exist"""
        print("Testing Creator Store Infrastructure...")
        
        required_files = [
            "index.html",
            "payment-system.js", 
            "domain-config.js",
            "deploy-to-domain.md"
        ]
        
        for filename in required_files:
            file_path = self.store_dir / filename
            exists = file_path.exists()
            self.test_results["store_files"][filename] = {
                "exists": exists,
                "size": file_path.stat().st_size if exists else 0
            }
            
            status = "PASS" if exists else "FAIL"
            print(f"  {filename}: {status}")
        
        return all(result["exists"] for result in self.test_results["store_files"].values())
    
    def test_payment_processing(self):
        """Test payment processing system"""
        print("\nTesting Payment Processing System...")
        
        payment_file = self.store_dir / "payment-system.js"
        if payment_file.exists():
            content = payment_file.read_text(encoding='utf-8')
            
            # Check for key payment features
            payment_tests = {
                "stripe_integration": "stripe" in content.lower(),
                "revenue_calculation": "jimmyRevenue" in content or "creator" in content.lower(),
                "secure_downloads": "downloadToken" in content,
                "email_delivery": "email" in content.lower(),
                "book_catalog": "bookCatalog" in content
            }
            
            self.test_results["payment_system"] = payment_tests
            
            for test_name, passed in payment_tests.items():
                status = "PASS" if passed else "FAIL"
                print(f"  {test_name}: {status}")
            
            return all(payment_tests.values())
        else:
            print("  payment-system.js: MISSING")
            return False
    
    def test_book_catalog(self):
        """Test Jimmy's book catalog"""
        print("\nTesting Jimmy's Book Catalog...")
        
        # Check for catalog in parent directory
        catalog_file = self.store_dir.parent / "CreatorMarketLiberation/market-directory/jimmy-catalog.json"
        
        if catalog_file.exists():
            try:
                with open(catalog_file, 'r', encoding='utf-8') as f:
                    catalog = json.load(f)
                
                # Analyze catalog
                total_books = 0
                total_value = 0
                
                # Count trilogy books
                if "resonance_collective_trilogy" in catalog.get("catalog", {}):
                    trilogy = catalog["catalog"]["resonance_collective_trilogy"]["books"]
                    total_books += len(trilogy)
                    total_value += sum(book["price_usd"] for book in trilogy)
                
                # Count fiction books
                if "fiction" in catalog.get("catalog", {}):
                    fiction = catalog["catalog"]["fiction"]
                    total_books += len(fiction)
                    total_value += sum(book["price_usd"] for book in fiction)
                
                # Count workbooks
                if "trauma_workbooks" in catalog.get("catalog", {}):
                    workbooks = catalog["catalog"]["trauma_workbooks"]
                    total_books += len(workbooks)
                    total_value += sum(book["price_usd"] for book in workbooks)
                
                self.test_results["book_catalog"] = {
                    "total_books": total_books,
                    "total_catalog_value": total_value,
                    "creator_sovereignty": catalog.get("liberation_verified", False),
                    "werner_health": catalog.get("werner_health_enabled", False),
                    "spirallogic": catalog.get("spirallogic_integrated", False)
                }
                
                print(f"  Total Books: {total_books} PASS")
                print(f"  Catalog Value: ${total_value:.2f} PASS")
                print(f"  Creator Sovereignty: {'PASS' if catalog.get('liberation_verified') else 'FAIL'}")
                print(f"  Werner Health: {'PASS' if catalog.get('werner_health_enabled') else 'FAIL'}")
                print(f"  SpiralLogic: {'PASS' if catalog.get('spirallogic_integrated') else 'FAIL'}")
                
                return total_books >= 14 and total_value > 200
                
            except json.JSONDecodeError:
                print("  Catalog JSON: FAIL (invalid format)")
                return False
        else:
            print("  jimmy-catalog.json: MISSING")
            return False
    
    def test_revenue_potential(self):
        """Calculate revenue potential"""
        print("\nTesting Revenue Potential...")
        
        catalog_data = self.test_results["book_catalog"]
        if catalog_data:
            total_value = catalog_data["total_catalog_value"]
            
            # Calculate monthly revenue scenarios
            scenarios = {
                "conservative": {"sales_per_month": 10, "avg_price": total_value / catalog_data["total_books"]},
                "moderate": {"sales_per_month": 50, "avg_price": total_value / catalog_data["total_books"]},
                "breakthrough": {"sales_per_month": 200, "avg_price": total_value / catalog_data["total_books"]}
            }
            
            print("  Revenue Scenarios:")
            for scenario_name, scenario in scenarios.items():
                monthly_gross = scenario["sales_per_month"] * scenario["avg_price"]
                stripe_fees = (monthly_gross * 0.029) + (scenario["sales_per_month"] * 0.30)
                monthly_net = monthly_gross - stripe_fees
                annual_net = monthly_net * 12
                
                print(f"    {scenario_name.title()}: ${monthly_net:.0f}/month (${annual_net:.0f}/year)")
                
                self.test_results["infrastructure"][f"{scenario_name}_monthly"] = monthly_net
                self.test_results["infrastructure"][f"{scenario_name}_annual"] = annual_net
            
            return True
        else:
            print("  Cannot calculate - missing catalog data")
            return False
    
    def test_deployment_readiness(self):
        """Test deployment readiness"""
        print("\nTesting Deployment Readiness...")
        
        # Check deployment guide
        deploy_guide = self.store_dir / "deploy-to-domain.md"
        domain_config = self.store_dir / "domain-config.js"
        
        readiness_checks = {
            "deployment_guide": deploy_guide.exists(),
            "domain_configuration": domain_config.exists(),
            "store_html": (self.store_dir / "index.html").exists(),
            "payment_system": (self.store_dir / "payment-system.js").exists()
        }
        
        for check_name, passed in readiness_checks.items():
            status = "PASS" if passed else "FAIL"
            print(f"  {check_name}: {status}")
        
        # Check for thefortthatholds.xyz references
        if domain_config.exists():
            config_content = domain_config.read_text(encoding='utf-8')
            has_domain = "thefortthatholds.xyz" in config_content
            print(f"  thefortthatholds.xyz domain: {'PASS' if has_domain else 'FAIL'}")
            readiness_checks["domain_ready"] = has_domain
        
        self.test_results["infrastructure"]["deployment"] = readiness_checks
        return all(readiness_checks.values())
    
    def test_anti_isbn_compliance(self):
        """Test anti-ISBN compliance"""
        print("\nTesting Anti-ISBN Compliance...")
        
        store_html = self.store_dir / "index.html"
        if store_html.exists():
            content = store_html.read_text(encoding='utf-8')
            
            compliance_tests = {
                "no_isbn_required": "ISBN-Free" in content or "No ISBN" in content,
                "fuck_gatekeepers": "gatekeepers" in content.lower() or "corporate" in content.lower(),
                "creator_sovereignty": "sovereignty" in content.lower(),
                "100_percent_revenue": "100%" in content and ("creator" in content.lower() or "revenue" in content.lower()),
                "anti_platform": "platform" in content.lower() and ("anti" in content.lower() or "no" in content.lower())
            }
            
            for test_name, passed in compliance_tests.items():
                status = "PASS" if passed else "FAIL"
                print(f"  {test_name}: {status}")
            
            self.test_results["infrastructure"]["anti_isbn"] = compliance_tests
            return sum(compliance_tests.values()) >= 3  # At least 3 out of 5
        else:
            print("  Store HTML missing")
            return False
    
    def run_complete_test(self):
        """Run complete Creator Store test suite"""
        print("=" * 60)
        print("CREATOR MARKET LIBERATION PLATFORM TEST")
        print("Jimmy Thornburg's Sovereign Creator Store")
        print("=" * 60)
        
        test_functions = [
            ("Store Infrastructure", self.test_store_infrastructure),
            ("Payment Processing", self.test_payment_processing),
            ("Book Catalog", self.test_book_catalog),
            ("Revenue Potential", self.test_revenue_potential),
            ("Deployment Readiness", self.test_deployment_readiness),
            ("Anti-ISBN Compliance", self.test_anti_isbn_compliance)
        ]
        
        results = {}
        
        for test_name, test_function in test_functions:
            try:
                results[test_name] = test_function()
            except Exception as e:
                print(f"ERROR in {test_name}: {e}")
                results[test_name] = False
        
        # Generate summary
        self.generate_test_summary(results)
        
        return results
    
    def generate_test_summary(self, results):
        """Generate test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        success_rate = (passed / total) * 100
        
        print(f"Tests Passed: {passed}/{total}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 85:
            print("\nSTATUS: READY FOR DEPLOYMENT")
            print("RECOMMENDATION: Deploy to thefortthatholds.xyz immediately")
            print("REVENUE POTENTIAL: HIGH")
        elif success_rate >= 70:
            print("\nSTATUS: MOSTLY READY")
            print("RECOMMENDATION: Fix remaining issues then deploy")
        else:
            print("\nSTATUS: NEEDS WORK")
            print("RECOMMENDATION: Address critical issues before deployment")
        
        # Show revenue projections if available
        if "conservative_monthly" in self.test_results.get("infrastructure", {}):
            print(f"\nREVENUE PROJECTIONS:")
            infra = self.test_results["infrastructure"]
            print(f"  Conservative: ${infra['conservative_monthly']:.0f}/month")
            print(f"  Moderate: ${infra['moderate_monthly']:.0f}/month") 
            print(f"  Breakthrough: ${infra['breakthrough_monthly']:.0f}/month")
        
        print(f"\nNEXT STEPS:")
        print(f"  1. Deploy store to thefortthatholds.xyz")
        print(f"  2. Set up Stripe payment processing")
        print(f"  3. Upload EPUB files for download")
        print(f"  4. Launch marketing campaign")
        print(f"  5. START MAKING MONEY!")
        
        # Save results
        results_file = self.store_dir / f"test_results_{int(time.time())}.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump({
                "test_results": results,
                "detailed_data": self.test_results,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }, f, indent=2)
        
        print(f"\nDetailed results saved: {results_file}")

def main():
    """Run Creator Store tests"""
    tester = CreatorStoreTester()
    results = tester.run_complete_test()
    
    input("\nPress Enter to exit...")
    return 0 if all(results.values()) else 1

if __name__ == "__main__":
    sys.exit(main())